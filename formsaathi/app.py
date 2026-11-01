"""
FormSaathi — Smart Scholarship & Government Document Assistant
Main Flask Application Controller
"""

import os
import re
import secrets
import json
from datetime import datetime
from functools import wraps

from flask import (
    Flask, render_template, request, redirect, url_for,
    session, flash, jsonify, send_from_directory, abort
)
from werkzeug.utils import secure_filename

from models import (
    get_db, init_db, initialize_student_checklist, DATABASE_PATH
)

app = Flask(__name__)

# Base configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'formsaathi-production-grade-session-key-2026')
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB limit
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}

# Ensure required directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)

# Initialize Database on import
init_db()


# -------------------------------------------------------------
# Security & Helper Functions
# -------------------------------------------------------------

def allowed_file(filename):
    """Checks if uploaded file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def generate_csrf_token():
    """Generates or retrieves a session-bound CSRF token."""
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(32)
    return session['csrf_token']


app.jinja_env.globals['csrf_token'] = generate_csrf_token


@app.before_request
def verify_csrf():
    """Verifies CSRF token on modifying requests unless disabled."""
    if app.config.get('TESTING') and app.config.get('CSRF_DISABLED', False):
        return
    if request.method in ('POST', 'PUT', 'DELETE'):
        token = request.form.get('csrf_token') or request.headers.get('X-CSRFToken')
        expected = session.get('csrf_token')
        if not expected or token != expected:
            # Check if JSON request with valid token
            if request.is_json and request.json:
                json_token = request.json.get('csrf_token')
                if json_token and json_token == expected:
                    return
            # Allow fallback if no session yet exists during initial welcome POST
            if request.endpoint == 'welcome_setup' and request.form.get('csrf_token'):
                return
            abort(403, description="CSRF token validation failed. Please refresh the page.")


def get_current_student():
    """Retrieves current student from session."""
    student_id = session.get('student_id')
    if not student_id:
        return None
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = cursor.fetchone()
    conn.close()
    return student


def student_required(f):
    """Decorator to require a student profile setup before accessing sections."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        student = get_current_student()
        if not student:
            flash("Please complete your student profile setup first to access FormSaathi.", "info")
            return redirect(url_for('welcome_setup'))
        return f(*args, **kwargs)
    return decorated_function


@app.context_processor
def inject_global_data():
    """Provides student profile and notification counts to all Jinja templates."""
    student = get_current_student()
    unread_count = 0
    checklist_stats = {'total': 0, 'ready': 0, 'pending': 0, 'percent': 0}

    if student:
        conn = get_db()
        cursor = conn.cursor()
        # Count unread notifications
        cursor.execute("""
            SELECT COUNT(*) as count FROM notifications 
            WHERE (student_id = ? OR student_id IS NULL) AND is_read = 0
        """, (student['id'],))
        unread_row = cursor.fetchone()
        if unread_row:
            unread_count = unread_row['count']

        # Checklist stats
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
            FROM checklist_items WHERE student_id = ?
        """, (student['id'],))
        stats_row = cursor.fetchone()
        if stats_row and stats_row['total'] > 0:
            ready_c = stats_row['ready'] or 0
            pending_c = stats_row['pending'] or 0
            total_c = stats_row['total'] or 0
            pct = round((ready_c / total_c) * 100)
            checklist_stats = {
                'total': total_c,
                'ready': ready_c,
                'pending': pending_c,
                'percent': pct
            }
        conn.close()

    return {
        'current_student': student,
        'unread_notifications_count': unread_count,
        'checklist_stats': checklist_stats,
        'current_year': '2026-27'
    }


# -------------------------------------------------------------
# Section 2: First Page — Student Information Setup
# -------------------------------------------------------------

@app.route('/')
def index():
    """Root redirect: If profile exists, go to home; else show welcome setup."""
    if session.get('student_id'):
        return redirect(url_for('home'))
    return redirect(url_for('welcome_setup'))


@app.route('/welcome', methods=['GET', 'POST'])
def welcome_setup():
    """Initial onboarding page for student information setup."""
    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        email = request.form.get('email', '').strip().lower()
        class_course = request.form.get('class_course', '').strip()
        course_custom = request.form.get('course_custom', '').strip()
        institution_name = request.form.get('institution_name', '').strip()
        scholarship_interest = request.form.get('scholarship_interest', '').strip()
        academic_year = request.form.get('academic_year', '2026-2027').strip()
        state = request.form.get('state', 'All India').strip()
        category = request.form.get('category', 'General').strip()

        # Validations
        errors = []
        if not full_name or len(full_name) < 2:
            errors.append("Please enter a valid full name.")
        
        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not email or not re.match(email_regex, email):
            errors.append("Please enter a valid email address.")
        
        if not class_course:
            errors.append("Please select your class or course level.")
        elif class_course == 'Other' and not course_custom:
            errors.append("Please specify your custom course name.")

        if not institution_name or len(institution_name) < 2:
            errors.append("Please provide your college or school name.")

        if not scholarship_interest:
            errors.append("Please select a target scholarship or scheme.")

        if errors:
            for err in errors:
                flash(err, "error")
            return render_template('welcome.html', form_data=request.form)

        # Save student profile to SQLite
        effective_course = course_custom if class_course == 'Other' else class_course
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO students (
                full_name, email, class_course, course_custom,
                institution_name, scholarship_interest, academic_year,
                state, category
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            full_name, email, class_course, course_custom,
            institution_name, scholarship_interest, academic_year,
            state, category
        ))
        student_id = cursor.lastrowid
        conn.commit()
        conn.close()

        # Initialize student checklist tailored to course and scholarship
        initialize_student_checklist(student_id, effective_course, scholarship_interest)

        # Store session
        session['student_id'] = student_id
        flash(f"Welcome to FormSaathi, {full_name}! Your personalized scholarship assistant is ready.", "success")
        return redirect(url_for('home'))

    return render_template('welcome.html', form_data={})


# -------------------------------------------------------------
# Section 4: Home Section
# -------------------------------------------------------------

@app.route('/home')
@student_required
def home():
    """Home page with announcements ticker, welcome banner, feature cards, and quick actions."""
    student = get_current_student()
    conn = get_db()
    cursor = conn.cursor()

    # Announcements ticker data (confirmed vs demo clearly distinguished)
    cursor.execute("""
        SELECT * FROM notifications 
        WHERE category IN ('announcement', 'deadline', 'reminder')
        ORDER BY published_date DESC LIMIT 6
    """)
    announcements = cursor.fetchall()

    # Schemes count
    cursor.execute("SELECT COUNT(*) as count FROM schemes")
    schemes_count = cursor.fetchone()['count']

    # Online portals count
    cursor.execute("SELECT COUNT(*) as count FROM online_portals")
    portals_count = cursor.fetchone()['count']

    conn.close()

    return render_template(
        'home.html',
        student=student,
        announcements=announcements,
        schemes_count=schemes_count,
        portals_count=portals_count
    )


# -------------------------------------------------------------
# Section 5: Documents Need Section
# -------------------------------------------------------------

@app.route('/documents-need')
@student_required
def documents_need():
    """Detailed document checklist tailored to the student with filtering and print support."""
    student = get_current_student()
    category_filter = request.args.get('category', 'All')
    status_filter = request.args.get('status', 'All')

    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM checklist_items WHERE student_id = ?"
    params = [student['id']]

    if category_filter != 'All':
        query += " AND category = ?"
        params.append(category_filter)

    if status_filter != 'All':
        query += " AND status = ?"
        params.append(status_filter.lower())

    query += " ORDER BY is_mandatory DESC, id ASC"
    cursor.execute(query, params)
    items = cursor.fetchall()

    # Get category list for filter buttons
    cursor.execute("SELECT DISTINCT category FROM checklist_items WHERE student_id = ?", (student['id'],))
    categories = [row['category'] for row in cursor.fetchall()]

    conn.close()

    return render_template(
        'documents_need.html',
        student=student,
        checklist_items=items,
        categories=categories,
        current_category=category_filter,
        current_status=status_filter
    )


@app.route('/api/checklist/update', methods=['POST'])
@student_required
def update_checklist_status():
    """API endpoint to update document readiness status ('ready', 'pending', 'not_applicable')."""
    student = get_current_student()
    item_id = request.form.get('item_id') or (request.is_json and request.json.get('item_id'))
    new_status = request.form.get('status') or (request.is_json and request.json.get('status'))

    if not item_id or new_status not in ('ready', 'pending', 'not_applicable'):
        return jsonify({'success': False, 'error': 'Invalid request parameters.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE checklist_items 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND student_id = ?
    """, (new_status, item_id, student['id']))
    conn.commit()

    # Recalculate stats
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
        FROM checklist_items WHERE student_id = ?
    """, (student['id'],))
    row = cursor.fetchone()
    conn.close()

    total = row['total'] or 0
    ready = row['ready'] or 0
    percent = round((ready / total) * 100) if total > 0 else 0

    return jsonify({
        'success': True,
        'item_id': item_id,
        'new_status': new_status,
        'percent': percent,
        'ready_count': ready,
        'pending_count': row['pending'] or 0,
        'total_count': total
    })


@app.route('/api/checklist/reset', methods=['POST'])
@student_required
def reset_checklist():
    """Resets all checklist items to pending."""
    student = get_current_student()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE checklist_items SET status = 'pending' WHERE student_id = ?", (student['id'],))
    conn.commit()
    conn.close()
    flash("Checklist status has been reset to pending.", "info")
    return redirect(url_for('documents_need'))


# -------------------------------------------------------------
# Section 6: My Documents Section (Secure Storage)
# -------------------------------------------------------------

@app.route('/my-documents')
@student_required
def my_documents():
    """Document repository where students manage uploaded files privately."""
    student = get_current_student()
    category_filter = request.args.get('category', 'All')
    search_query = request.args.get('q', '').strip()

    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM student_documents WHERE student_id = ?"
    params = [student['id']]

    if category_filter != 'All':
        query += " AND doc_category = ?"
        params.append(category_filter)

    if search_query:
        query += " AND (custom_label LIKE ? OR original_filename LIKE ?)"
        params.extend([f"%{search_query}%", f"%{search_query}%"])

    query += " ORDER BY uploaded_at DESC"
    cursor.execute(query, params)
    docs = cursor.fetchall()

    # Document categories
    categories = ['Aadhaar / ID', 'Academic Marksheet', 'Income Certificate', 'Caste Certificate', 'Bonafide Letter', 'Bank Document', 'Fee Receipt', 'Other']

    conn.close()

    return render_template(
        'my_documents.html',
        student=student,
        documents=docs,
        categories=categories,
        current_category=category_filter,
        search_query=search_query
    )


@app.route('/documents/upload', methods=['POST'])
@student_required
def upload_document():
    """Securely handles file uploads and attaches to student profile."""
    student = get_current_student()

    if 'document_file' not in request.files:
        flash("No file was selected for upload.", "error")
        return redirect(url_for('my_documents'))

    file = request.files['document_file']
    doc_category = request.form.get('doc_category', 'Other').strip()
    custom_label = request.form.get('custom_label', '').strip()

    if file.filename == '':
        flash("Please select a file to upload.", "error")
        return redirect(url_for('my_documents'))

    if not allowed_file(file.filename):
        flash("Unsupported file format. Only PDF, JPG, and PNG files under 10MB are permitted.", "error")
        return redirect(url_for('my_documents'))

    original_filename = secure_filename(file.filename)
    if not custom_label:
        custom_label = os.path.splitext(original_filename)[0]

    # Student private upload folder
    student_dir = os.path.join(app.config['UPLOAD_FOLDER'], str(student['id']))
    os.makedirs(student_dir, exist_ok=True)

    # Unique stored filename to prevent collisions & direct access attacks
    unique_prefix = secrets.token_hex(8)
    file_ext = original_filename.rsplit('.', 1)[1].lower()
    stored_filename = f"{unique_prefix}_{int(datetime.now().timestamp())}.{file_ext}"
    dest_path = os.path.join(student_dir, stored_filename)

    file.save(dest_path)
    file_size = os.path.getsize(dest_path)
    mime_type = file.mimetype or 'application/octet-stream'

    # Save metadata in DB
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO student_documents (
            student_id, doc_category, custom_label, original_filename,
            stored_filename, file_size, mime_type, verification_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_review')
    """, (
        student['id'], doc_category, custom_label, original_filename,
        stored_filename, file_size, mime_type
    ))
    conn.commit()
    conn.close()

    flash(f"Document '{custom_label}' uploaded successfully and stored securely.", "success")
    return redirect(url_for('my_documents'))


@app.route('/documents/<int:doc_id>/view')
@student_required
def view_document(doc_id):
    """Protected route to view/preview an uploaded document."""
    student = get_current_student()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM student_documents WHERE id = ? AND student_id = ?
    """, (doc_id, student['id']))
    doc = cursor.fetchone()
    conn.close()

    if not doc:
        abort(404, description="Document not found or access denied.")

    student_dir = os.path.join(app.config['UPLOAD_FOLDER'], str(student['id']))
    return send_from_directory(
        student_dir,
        doc['stored_filename'],
        mimetype=doc['mime_type'],
        as_attachment=False
    )


@app.route('/documents/<int:doc_id>/download')
@student_required
def download_document(doc_id):
    """Protected route to download an uploaded document with original filename."""
    student = get_current_student()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM student_documents WHERE id = ? AND student_id = ?
    """, (doc_id, student['id']))
    doc = cursor.fetchone()
    conn.close()

    if not doc:
        abort(404, description="Document not found or access denied.")

    student_dir = os.path.join(app.config['UPLOAD_FOLDER'], str(student['id']))
    return send_from_directory(
        student_dir,
        doc['stored_filename'],
        download_name=doc['original_filename'],
        as_attachment=True
    )


@app.route('/documents/<int:doc_id>/delete', methods=['POST'])
@student_required
def delete_document(doc_id):
    """Securely deletes an uploaded file from disk and database."""
    student = get_current_student()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM student_documents WHERE id = ? AND student_id = ?
    """, (doc_id, student['id']))
    doc = cursor.fetchone()

    if not doc:
        conn.close()
        flash("Document not found.", "error")
        return redirect(url_for('my_documents'))

    # Delete physical file
    student_dir = os.path.join(app.config['UPLOAD_FOLDER'], str(student['id']))
    filepath = os.path.join(student_dir, doc['stored_filename'])
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
        except Exception:
            pass

    cursor.execute("DELETE FROM student_documents WHERE id = ?", (doc_id,))
    conn.commit()
    conn.close()

    flash("Document deleted successfully.", "info")
    return redirect(url_for('my_documents'))


@app.route('/documents/<int:doc_id>/toggle-status', methods=['POST'])
@student_required
def toggle_document_status(doc_id):
    """Marks document as 'verified_by_student' or 'pending_review'."""
    student = get_current_student()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT verification_status FROM student_documents WHERE id = ? AND student_id = ?", (doc_id, student['id']))
    doc = cursor.fetchone()

    if not doc:
        conn.close()
        return jsonify({'success': False, 'error': 'Not found'}), 404

    new_status = 'verified_by_student' if doc['verification_status'] == 'pending_review' else 'pending_review'
    cursor.execute("UPDATE student_documents SET verification_status = ? WHERE id = ?", (new_status, doc_id))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'new_status': new_status})


# -------------------------------------------------------------
# Section 7: Dashboard Section
# -------------------------------------------------------------

@app.route('/dashboard')
@student_required
def dashboard():
    """Summary dashboard displaying preparation statistics, eligibility history, and alerts."""
    student = get_current_student()
    conn = get_db()
    cursor = conn.cursor()

    # Checklist stats
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'not_applicable' THEN 1 ELSE 0 END) as na
        FROM checklist_items WHERE student_id = ?
    """, (student['id'],))
    checklist_row = cursor.fetchone()

    # Document upload stats
    cursor.execute("""
        SELECT COUNT(*) as uploaded_count,
               SUM(CASE WHEN verification_status = 'verified_by_student' THEN 1 ELSE 0 END) as verified_count
        FROM student_documents WHERE student_id = ?
    """, (student['id'],))
    upload_row = cursor.fetchone()

    # Latest eligibility check record
    cursor.execute("""
        SELECT * FROM eligibility_records 
        WHERE student_id = ? 
        ORDER BY checked_at DESC LIMIT 1
    """, (student['id'],))
    latest_check = cursor.fetchone()
    latest_check_details = None
    if latest_check:
        try:
            latest_check_details = json.loads(latest_check['conditions_summary'])
        except Exception:
            latest_check_details = []

    # Recent notifications
    cursor.execute("""
        SELECT * FROM notifications 
        WHERE (student_id = ? OR student_id IS NULL)
        ORDER BY published_date DESC LIMIT 4
    """, (student['id'],))
    recent_notifs = cursor.fetchall()

    conn.close()

    total_docs = checklist_row['total'] or 0
    ready_docs = checklist_row['ready'] or 0
    pending_docs = checklist_row['pending'] or 0
    na_docs = checklist_row['na'] or 0
    pct = round((ready_docs / total_docs) * 100) if total_docs > 0 else 0

    return render_template(
        'dashboard.html',
        student=student,
        stats={
            'total': total_docs,
            'ready': ready_docs,
            'pending': pending_docs,
            'na': na_docs,
            'percent': pct,
            'uploaded': upload_row['uploaded_count'] or 0,
            'student_verified': upload_row['verified_count'] or 0
        },
        latest_check=latest_check,
        latest_check_details=latest_check_details,
        recent_notifications=recent_notifs
    )


# -------------------------------------------------------------
# Section 8: Eligibility Checker
# -------------------------------------------------------------

@app.route('/eligibility-checker')
@student_required
def eligibility_checker():
    """Interactive scholarship eligibility assessment wizard."""
    student = get_current_student()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes ORDER BY provider_type ASC, name ASC")
    schemes = cursor.fetchall()

    # Fetch past eligibility evaluations
    cursor.execute("""
        SELECT * FROM eligibility_records 
        WHERE student_id = ? 
        ORDER BY checked_at DESC LIMIT 5
    """, (student['id'],))
    past_records = cursor.fetchall()
    conn.close()

    return render_template(
        'eligibility.html',
        student=student,
        schemes=schemes,
        past_records=past_records,
        result=None
    )


@app.route('/eligibility-checker/check', methods=['POST'])
@student_required
def process_eligibility_check():
    """Evaluates student submitted data against configured scholarship criteria."""
    student = get_current_student()
    scheme_id = request.form.get('scheme_id')
    class_course = request.form.get('class_course', student['class_course']).strip()
    institution_type = request.form.get('institution_type', 'Government').strip()
    marks_str = request.form.get('marks_percent', '0').strip()
    income_str = request.form.get('annual_income', '0').strip()
    domicile_state = request.form.get('domicile_state', student['state']).strip()
    social_category = request.form.get('category', student['category']).strip()
    gender = request.form.get('gender', 'Other').strip()

    try:
        marks = float(marks_str)
    except ValueError:
        marks = 0.0

    try:
        income = int(income_str)
    except ValueError:
        income = 0

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes WHERE id = ?", (scheme_id,))
    scheme = cursor.fetchone()

    if not scheme:
        conn.close()
        flash("Please select a valid scholarship scheme for evaluation.", "error")
        return redirect(url_for('eligibility_checker'))

    conditions = []
    failed_conditions = 0
    warning_conditions = 0

    # Condition 1: Education Level Check
    scheme_level = scheme['education_level']
    if scheme_level == 'All Levels':
        conditions.append({
            'rule': 'Course Level Compatibility',
            'detail': f'Scheme accepts students from All Levels. You selected: {class_course}.',
            'status': 'PASS'
        })
    elif scheme_level.lower() in class_course.lower():
        conditions.append({
            'rule': 'Course Level Compatibility',
            'detail': f'Your course level ({class_course}) matches the required level ({scheme_level}).',
            'status': 'PASS'
        })
    else:
        failed_conditions += 1
        conditions.append({
            'rule': 'Course Level Compatibility',
            'detail': f'Scheme is designed for {scheme_level}, but you selected {class_course}.',
            'status': 'FAIL'
        })

    # Condition 2: Income Ceiling Check
    income_ceiling = scheme['income_ceiling_annual']
    if income_ceiling and income_ceiling > 0:
        if income <= 0:
            warning_conditions += 1
            conditions.append({
                'rule': 'Annual Family Income',
                'detail': f'Income ceiling is Rs. {income_ceiling:,}. Please provide valid positive income for precise determination.',
                'status': 'WARN'
            })
        elif income <= income_ceiling:
            conditions.append({
                'rule': 'Annual Family Income',
                'detail': f'Reported income Rs. {income:,} is within the required ceiling of Rs. {income_ceiling:,}.',
                'status': 'PASS'
            })
        else:
            failed_conditions += 1
            conditions.append({
                'rule': 'Annual Family Income',
                'detail': f'Reported income Rs. {income:,} exceeds the mandated ceiling of Rs. {income_ceiling:,}.',
                'status': 'FAIL'
            })
    else:
        conditions.append({
            'rule': 'Annual Family Income',
            'detail': 'No hard annual income ceiling specified by this scheme.',
            'status': 'INFO'
        })

    # Condition 3: Academic Merit Marks Check
    min_marks = scheme['min_marks_percent']
    if min_marks and min_marks > 0:
        if marks >= min_marks:
            conditions.append({
                'rule': 'Minimum Academic Marks',
                'detail': f'Achieved {marks}% meets or exceeds the required minimum {min_marks}%.',
                'status': 'PASS'
            })
        else:
            failed_conditions += 1
            conditions.append({
                'rule': 'Minimum Academic Marks',
                'detail': f'Achieved {marks}% is below the required {min_marks}%.',
                'status': 'FAIL'
            })
    else:
        conditions.append({
            'rule': 'Minimum Academic Marks',
            'detail': 'Passing criteria in qualifying exam required with no strict cut-off percentage.',
            'status': 'INFO'
        })

    # Condition 4: Gender-Specific Check
    if scheme['scheme_type'] == 'Girls Only':
        if gender.lower() == 'female':
            conditions.append({
                'rule': 'Target Gender Specification',
                'detail': 'Eligible: Scheme is exclusively for female students.',
                'status': 'PASS'
            })
        else:
            failed_conditions += 1
            conditions.append({
                'rule': 'Target Gender Specification',
                'detail': f'Ineligible: Scheme is exclusively reserved for female applicants (You selected: {gender}).',
                'status': 'FAIL'
            })

    # Condition 5: Social Category Check (for SC/ST/OBC specific schemes)
    if 'SC' in scheme['code'] and social_category != 'SC':
        failed_conditions += 1
        conditions.append({
            'rule': 'Social Category / Reservation',
            'detail': f'This scheme requires applicant to belong to Scheduled Caste (SC). Your category: {social_category}.',
            'status': 'FAIL'
        })
    elif 'OBC' in scheme['code'] and social_category not in ('OBC', 'OBC-NCL', 'EBC'):
        failed_conditions += 1
        conditions.append({
            'rule': 'Social Category / Reservation',
            'detail': f'This scheme requires applicant to belong to OBC / EBC category. Your category: {social_category}.',
            'status': 'FAIL'
        })

    # Condition 6: Domicile / Regional Check (e.g. Ishan Uday)
    if 'ISHAN-UDAY' in scheme['code']:
        ner_states = ['Assam', 'Arunachal Pradesh', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura']
        if domicile_state in ner_states:
            conditions.append({
                'rule': 'Regional Domicile Requirement',
                'detail': f'Verified: Domicile {domicile_state} is recognized as part of North Eastern Region (NER).',
                'status': 'PASS'
            })
        else:
            failed_conditions += 1
            conditions.append({
                'rule': 'Regional Domicile Requirement',
                'detail': f'Ineligible: Applicant must have Permanent Residence in North Eastern Region states. Your state: {domicile_state}.',
                'status': 'FAIL'
            })

    # Determine final result outcome strictly in line with prompt instructions
    if marks <= 0 and income <= 0:
        result_status = 'insufficient'
        result_text = "Insufficient information to determine eligibility"
        result_badge = "insufficient"
    elif failed_conditions > 0:
        result_status = 'ineligible'
        result_text = "One or more listed conditions are not met"
        result_badge = "danger"
    elif warning_conditions > 0 or scheme['provider_type'] == 'Private/CSR':
        result_status = 'conditional'
        result_text = "May be eligible; additional conditions need checking"
        result_badge = "warning"
    else:
        result_status = 'eligible'
        result_text = "Appears eligible based on the information provided"
        result_badge = "success"

    # Save to history
    input_payload = {
        'class_course': class_course,
        'marks_percent': marks,
        'annual_income': income,
        'institution_type': institution_type,
        'domicile_state': domicile_state,
        'category': social_category,
        'gender': gender
    }
    cursor.execute("""
        INSERT INTO eligibility_records (
            student_id, scheme_id, scheme_name, input_data,
            result_status, conditions_summary
        ) VALUES (?, ?, ?, ?, ?, ?)
    """, (
        student['id'], scheme['id'], scheme['name'],
        json.dumps(input_payload), result_status, json.dumps(conditions)
    ))
    conn.commit()

    # Re-fetch past records and all schemes
    cursor.execute("SELECT * FROM schemes ORDER BY provider_type ASC, name ASC")
    all_schemes = cursor.fetchall()
    cursor.execute("SELECT * FROM eligibility_records WHERE student_id = ? ORDER BY checked_at DESC LIMIT 5", (student['id'],))
    past_records = cursor.fetchall()
    conn.close()

    result_data = {
        'scheme': scheme,
        'status': result_status,
        'text': result_text,
        'badge': result_badge,
        'conditions': conditions,
        'official_url': scheme['official_url']
    }

    return render_template(
        'eligibility.html',
        student=student,
        schemes=all_schemes,
        past_records=past_records,
        result=result_data,
        form_data=request.form
    )


# -------------------------------------------------------------
# Section 9: Online Document Sites Section
# -------------------------------------------------------------

@app.route('/online-document-sites')
@student_required
def online_document_sites():
    """Directory of verified official government portals with state & category filtering."""
    student = get_current_student()
    state_filter = request.args.get('state', 'All India')
    category_filter = request.args.get('category', 'All')

    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM online_portals WHERE 1=1"
    params = []

    if state_filter != 'All India' and state_filter != 'All':
        query += " AND (state = ? OR state = 'All India' OR state = 'Multiple States')"
        params.append(state_filter)

    if category_filter != 'All':
        query += " AND category = ?"
        params.append(category_filter)

    query += " ORDER BY state ASC, name ASC"
    cursor.execute(query, params)
    portals = cursor.fetchall()

    # Distinct states & categories
    cursor.execute("SELECT DISTINCT state FROM online_portals WHERE state NOT IN ('All India', 'Multiple States')")
    states = [row['state'] for row in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT category FROM online_portals")
    categories = [row['category'] for row in cursor.fetchall()]

    conn.close()

    return render_template(
        'online_sites.html',
        student=student,
        portals=portals,
        states=states,
        categories=categories,
        current_state=state_filter,
        current_category=category_filter
    )


# -------------------------------------------------------------
# Section 10: Notifications Section
# -------------------------------------------------------------

@app.route('/notifications')
@student_required
def notifications():
    """Notifications center with filter tabs, read/unread status, and demo notice tags."""
    student = get_current_student()
    tab = request.args.get('filter', 'all')  # 'all', 'unread', 'read'

    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM notifications WHERE (student_id = ? OR student_id IS NULL)"
    params = [student['id']]

    if tab == 'unread':
        query += " AND is_read = 0"
    elif tab == 'read':
        query += " AND is_read = 1"

    query += " ORDER BY published_date DESC, id DESC"
    cursor.execute(query, params)
    notifs = cursor.fetchall()
    conn.close()

    return render_template(
        'notifications.html',
        student=student,
        notifications=notifs,
        current_tab=tab
    )


@app.route('/notifications/<int:notif_id>/toggle-read', methods=['POST'])
@student_required
def toggle_notification_read(notif_id):
    """Marks a single notification as read or unread."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT is_read FROM notifications WHERE id = ?", (notif_id,))
    notif = cursor.fetchone()

    if not notif:
        conn.close()
        return jsonify({'success': False, 'error': 'Notification not found'}), 404

    new_status = 1 if notif['is_read'] == 0 else 0
    cursor.execute("UPDATE notifications SET is_read = ? WHERE id = ?", (new_status, notif_id))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'is_read': new_status})


@app.route('/notifications/mark-all-read', methods=['POST'])
@student_required
def mark_all_notifications_read():
    """Marks all notifications as read."""
    student = get_current_student()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE notifications SET is_read = 1 
        WHERE (student_id = ? OR student_id IS NULL)
    """, (student['id'],))
    conn.commit()
    conn.close()

    flash("All notifications marked as read.", "info")
    return redirect(url_for('notifications'))


# -------------------------------------------------------------
# Section 11: Explore Schemes Section
# -------------------------------------------------------------

@app.route('/explore-schemes')
@student_required
def explore_schemes():
    """Searchable directory of Central, State, and Philanthropic scholarships."""
    student = get_current_student()
    level_filter = request.args.get('level', 'All')
    provider_filter = request.args.get('provider', 'All')
    type_filter = request.args.get('type', 'All')
    search_query = request.args.get('q', '').strip()

    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM schemes WHERE 1=1"
    params = []

    if level_filter != 'All':
        query += " AND (education_level = ? OR education_level = 'All Levels')"
        params.append(level_filter)

    if provider_filter != 'All':
        query += " AND provider_type = ?"
        params.append(provider_filter)

    if type_filter != 'All':
        query += " AND scheme_type = ?"
        params.append(type_filter)

    if search_query:
        query += " AND (name LIKE ? OR ministry_or_dept LIKE ? OR description LIKE ?)"
        params.extend([f"%{search_query}%", f"%{search_query}%", f"%{search_query}%"])

    query += " ORDER BY is_demo ASC, provider_type ASC, name ASC"
    cursor.execute(query, params)
    schemes = cursor.fetchall()
    conn.close()

    return render_template(
        'schemes.html',
        student=student,
        schemes=schemes,
        current_level=level_filter,
        current_provider=provider_filter,
        current_type=type_filter,
        search_query=search_query
    )


# -------------------------------------------------------------
# Section 12: Government Document Services Section
# -------------------------------------------------------------

@app.route('/government-document-services')
@student_required
def government_document_services():
    """'Government Document Services — Apply Online' step-by-step guides."""
    student = get_current_student()
    active_slug = request.args.get('service')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM gov_services ORDER BY id ASC")
    all_services = cursor.fetchall()

    selected_service = None
    if active_slug:
        cursor.execute("SELECT * FROM gov_services WHERE slug = ?", (active_slug,))
        selected_service = cursor.fetchone()

    if not selected_service and all_services:
        selected_service = all_services[0]

    conn.close()

    return render_template(
        'government_services.html',
        student=student,
        services=all_services,
        active_service=selected_service
    )


# -------------------------------------------------------------
# Student Profile Management & Reset
# -------------------------------------------------------------

@app.route('/profile/edit', methods=['GET', 'POST'])
@student_required
def edit_profile():
    """Allows updating student profile details."""
    student = get_current_student()
    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        class_course = request.form.get('class_course', '').strip()
        course_custom = request.form.get('course_custom', '').strip()
        institution_name = request.form.get('institution_name', '').strip()
        scholarship_interest = request.form.get('scholarship_interest', '').strip()
        academic_year = request.form.get('academic_year', '').strip()
        state = request.form.get('state', '').strip()
        category = request.form.get('category', '').strip()

        if not full_name or not institution_name or not scholarship_interest:
            flash("Please fill in all required fields.", "error")
            return redirect(url_for('edit_profile'))

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE students 
            SET full_name = ?, class_course = ?, course_custom = ?,
                institution_name = ?, scholarship_interest = ?, academic_year = ?,
                state = ?, category = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            full_name, class_course, course_custom, institution_name,
            scholarship_interest, academic_year, state, category, student['id']
        ))
        conn.commit()
        conn.close()

        flash("Profile information updated successfully.", "success")
        return redirect(url_for('dashboard'))

    return render_template('edit_profile.html', student=student)


@app.route('/profile/reset', methods=['POST'])
def reset_profile():
    """Clears current active session to switch student or start over."""
    session.pop('student_id', None)
    flash("Session reset. You can now setup a new student profile.", "info")
    return redirect(url_for('welcome_setup'))


# -------------------------------------------------------------
# Error Handlers
# -------------------------------------------------------------

@app.errorhandler(400)
def bad_request(e):
    return render_template('error.html', code=400, title="Bad Request", message=str(e.description or "Invalid request parameters.")), 400


@app.errorhandler(403)
def forbidden(e):
    return render_template('error.html', code=403, title="Forbidden", message=str(e.description or "Access not permitted or CSRF verification failed.")), 403


@app.errorhandler(404)
def not_found(e):
    return render_template('error.html', code=404, title="Page Not Found", message="The requested page or resource could not be found."), 404


@app.errorhandler(413)
def file_too_large(e):
    flash("File is too large. Maximum allowed size is 10 MB.", "error")
    return redirect(url_for('my_documents'))


@app.errorhandler(500)
def server_error(e):
    return render_template('error.html', code=500, title="Server Error", message="An unexpected error occurred. Please try again."), 500


if __name__ == '__main__':
    # Running locally
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting FormSaathi on http://127.0.0.1:{port}")
    app.run(host='127.0.0.1', port=port, debug=True)
