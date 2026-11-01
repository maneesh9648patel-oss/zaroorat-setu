"""
Comprehensive Automated Test Suite for FormSaathi
Tests onboarding, section navigation, document checklist, file upload,
eligibility checker rule engine, portals directory, notifications, and profile management.
"""

import os
import io
import json
import unittest
from app import app
from models import get_db, init_db, initialize_student_checklist


class FormSaathiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config['TESTING'] = True
        app.config['CSRF_DISABLED'] = True
        init_db()

    def setUp(self):
        self.client = app.test_client()

    def create_test_student(self):
        """Helper to create a test student and return student_id."""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO students (
                full_name, email, class_course, course_custom,
                institution_name, scholarship_interest, academic_year,
                state, category
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'Aarav Patel', 'aarav.patel@engineering.edu',
            'Undergraduate (B.Tech / B.Sc / B.Com / B.A / MBBS)', None,
            'National Institute of Technology Karnataka',
            'Central Sector Scheme of Scholarships (NSP CSSS)',
            '2026-2027', 'Karnataka', 'General'
        ))
        student_id = cursor.lastrowid
        conn.commit()
        conn.close()
        initialize_student_checklist(student_id, 'Undergraduate', 'Central Sector Scheme of Scholarships (NSP CSSS)')
        return student_id

    def test_01_root_redirect_to_welcome(self):
        """Unauthenticated user should be redirected to welcome setup."""
        response = self.client.get('/', follow_redirects=False)
        self.assertEqual(response.status_code, 302)
        self.assertIn('/welcome', response.headers['Location'])

    def test_02_welcome_validation(self):
        """Welcome form should validate invalid inputs."""
        res = self.client.post('/welcome', data={
            'full_name': '',
            'email': 'not-an-email',
            'csrf_token': 'dummy'
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"Please enter a valid full name", res.data)

    def test_03_student_onboarding_and_checklist_init(self):
        """Submitting valid student profile sets up session and generates customized checklist."""
        res = self.client.post('/welcome', data={
            'csrf_token': 'dummy',
            'full_name': 'Pooja Sharma',
            'email': 'pooja.sharma@delhiuniv.ac.in',
            'class_course': 'Undergraduate (B.Tech / B.Sc / B.Com / B.A / MBBS)',
            'institution_name': 'Delhi University',
            'scholarship_interest': 'AICTE Pragati Scholarship for Girl Students',
            'academic_year': '2026-2027',
            'state': 'Delhi',
            'category': 'General'
        }, follow_redirects=True)

        self.assertEqual(res.status_code, 200)
        self.assertIn(b"Welcome to FormSaathi, Pooja Sharma!", res.data)
        self.assertIn(b"FormSaathi Home", res.data)

        # Verify checklist items created in DB
        with self.client.session_transaction() as sess:
            student_id = sess.get('student_id')
            self.assertIsNotNone(student_id)

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM checklist_items WHERE student_id = ?", (student_id,))
        count = cursor.fetchone()['cnt']
        self.assertGreater(count, 5, "Checklist should have multiple default items")
        conn.close()

    def test_04_all_nine_sections_accessible(self):
        """Ensure all 9 mandatory sections return HTTP 200 with proper titles when authenticated."""
        student_id = self.create_test_student()
        with self.client.session_transaction() as sess:
            sess['student_id'] = student_id

        endpoints = [
            ('/home', b'FormSaathi Home'),
            ('/documents-need', b'Required Documents Checklist'),
            ('/my-documents', b'My Documents Repository'),
            ('/dashboard', b'Scholarship Preparation Dashboard'),
            ('/eligibility-checker', b'Scholarship Eligibility Checker'),
            ('/online-document-sites', b'Official Government Portals Directory'),
            ('/notifications', b'Notifications Center'),
            ('/explore-schemes', b'Scholarship Schemes Directory'),
            ('/government-document-services', b'Government Document Services')
        ]

        for url, expected_text in endpoints:
            res = self.client.get(url)
            self.assertEqual(res.status_code, 200, f"Endpoint {url} failed to load.")
            self.assertIn(expected_text, res.data, f"Endpoint {url} missing expected text.")

    def test_05_checklist_status_update_and_progress(self):
        """Test checklist status update to 'ready' and verify completion % calculation."""
        student_id = self.create_test_student()
        with self.client.session_transaction() as sess:
            sess['student_id'] = student_id

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM checklist_items WHERE student_id = ? LIMIT 1", (student_id,))
        item_id = cursor.fetchone()['id']
        conn.close()

        res = self.client.post('/api/checklist/update', json={
            'item_id': item_id,
            'status': 'ready'
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['new_status'], 'ready')
        self.assertGreater(data['percent'], 0)

    def test_06_document_upload_and_security(self):
        """Test document upload validation, storage security, view, and deletion."""
        student_id = self.create_test_student()
        with self.client.session_transaction() as sess:
            sess['student_id'] = student_id

        # 1. Invalid file extension rejection
        fake_exe = (io.BytesIO(b"executable code"), 'malicious.exe')
        res = self.client.post('/documents/upload', data={
            'doc_category': 'Other',
            'custom_label': 'Bad File',
            'document_file': fake_exe
        }, follow_redirects=True)
        self.assertIn(b"Unsupported file format", res.data)

        # 2. Valid PDF upload
        fake_pdf = (io.BytesIO(b"%PDF-1.4 sample marksheet content"), 'marksheet.pdf')
        res = self.client.post('/documents/upload', data={
            'doc_category': 'Academic Marksheet',
            'custom_label': 'Class 12 Marksheet',
            'document_file': fake_pdf
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"uploaded successfully", res.data)

        # Verify DB entry
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM student_documents WHERE student_id = ? ORDER BY id DESC LIMIT 1", (student_id,))
        doc = cursor.fetchone()
        self.assertIsNotNone(doc)
        doc_id = doc['id']
        conn.close()

        # 3. Document view/preview route
        res_view = self.client.get(f'/documents/{doc_id}/view')
        self.assertEqual(res_view.status_code, 200)
        res_view.close()

        # 4. Document download route
        res_dl = self.client.get(f'/documents/{doc_id}/download')
        self.assertEqual(res_dl.status_code, 200)
        self.assertIn('attachment', res_dl.headers.get('Content-Disposition', ''))
        res_dl.close()

        # 5. Toggle verification status
        res_toggle = self.client.post(f'/documents/{doc_id}/toggle-status')
        self.assertEqual(res_toggle.status_code, 200)
        self.assertEqual(res_toggle.get_json()['new_status'], 'verified_by_student')

        # 6. Delete document
        res_del = self.client.post(f'/documents/{doc_id}/delete', follow_redirects=True)
        self.assertEqual(res_del.status_code, 200)
        self.assertIn(b"Document deleted successfully", res_del.data)

    def test_07_eligibility_engine_outcomes(self):
        """Test eligibility logic against configured criteria."""
        student_id = self.create_test_student()
        with self.client.session_transaction() as sess:
            sess['student_id'] = student_id

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM schemes WHERE code = 'NSP-CSSS'")
        scheme = cursor.fetchone()
        scheme_id = scheme['id']
        conn.close()

        # Case A: Eligible (UG, 85%, Income 2,00,000 <= 4,50,000 ceiling)
        res_a = self.client.post('/eligibility-checker/check', data={
            'scheme_id': scheme_id,
            'class_course': 'Undergraduate',
            'institution_type': 'Government',
            'marks_percent': '85.5',
            'annual_income': '200000',
            'domicile_state': 'Karnataka',
            'category': 'General',
            'gender': 'Male'
        })
        self.assertEqual(res_a.status_code, 200)
        self.assertIn(b"Appears eligible based on the information provided", res_a.data)

        # Case B: Ineligible due to income exceeding ceiling (Income 6,00,000 > 4,50,000)
        res_b = self.client.post('/eligibility-checker/check', data={
            'scheme_id': scheme_id,
            'class_course': 'Undergraduate',
            'institution_type': 'Government',
            'marks_percent': '85.5',
            'annual_income': '600000',
            'domicile_state': 'Karnataka',
            'category': 'General',
            'gender': 'Male'
        })
        self.assertEqual(res_b.status_code, 200)
        self.assertIn(b"One or more listed conditions are not met", res_b.data)

        # Case C: Insufficient info (0 marks, 0 income)
        res_c = self.client.post('/eligibility-checker/check', data={
            'scheme_id': scheme_id,
            'class_course': 'Undergraduate',
            'institution_type': 'Government',
            'marks_percent': '0',
            'annual_income': '0',
            'domicile_state': 'Karnataka',
            'category': 'General',
            'gender': 'Male'
        })
        self.assertEqual(res_c.status_code, 200)
        self.assertIn(b"Insufficient information to determine eligibility", res_c.data)

    def test_08_notifications_toggle_and_mark_all(self):
        """Test notification read toggle and mark-all-read action."""
        student_id = self.create_test_student()
        with self.client.session_transaction() as sess:
            sess['student_id'] = student_id

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM notifications LIMIT 1")
        notif_id = cursor.fetchone()['id']
        conn.close()

        # Toggle single notification
        res = self.client.post(f'/notifications/{notif_id}/toggle-read')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])

        # Mark all read
        res_all = self.client.post('/notifications/mark-all-read', follow_redirects=True)
        self.assertEqual(res_all.status_code, 200)
        self.assertIn(b"All notifications marked as read", res_all.data)

    def test_09_profile_reset_flow(self):
        """Test resetting profile to allow onboarding as a new student."""
        student_id = self.create_test_student()
        with self.client.session_transaction() as sess:
            sess['student_id'] = student_id

        res = self.client.post('/profile/reset', follow_redirects=False)
        self.assertEqual(res.status_code, 302)
        self.assertIn('/welcome', res.headers['Location'])


if __name__ == '__main__':
    unittest.main()
