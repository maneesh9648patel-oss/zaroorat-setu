"""
FormSaathi Database & Models Module
Handles SQLite connection, schema creation, data seeding, and query operations.
"""

import sqlite3
import os
import json
from datetime import datetime

DATABASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'formsaathi.db')


def get_db():
    """Returns an active SQLite connection with row factory enabled."""
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Initializes tables and seeds base official information."""
    conn = get_db()
    cursor = conn.cursor()

    # 1. Students Profile Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        class_course TEXT NOT NULL,
        course_custom TEXT,
        institution_name TEXT NOT NULL,
        scholarship_interest TEXT NOT NULL,
        academic_year TEXT NOT NULL,
        state TEXT DEFAULT 'All India',
        category TEXT DEFAULT 'General',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Document Checklist Items Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS checklist_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        doc_key TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        is_mandatory INTEGER DEFAULT 1,
        why_needed TEXT NOT NULL,
        status TEXT DEFAULT 'pending', -- 'ready', 'pending', 'not_applicable'
        official_portal_name TEXT,
        official_portal_url TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    """)

    # 3. Uploaded Student Documents Table (Private Storage)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        doc_category TEXT NOT NULL,
        custom_label TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        stored_filename TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        verification_status TEXT DEFAULT 'pending_review', -- 'pending_review', 'verified_by_student'
        notes TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    """)

    # 4. Scholarship Schemes Directory
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS schemes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        provider_type TEXT NOT NULL, -- 'Central Govt', 'State Govt', 'Private/CSR'
        ministry_or_dept TEXT NOT NULL,
        education_level TEXT NOT NULL, -- 'School', 'Diploma', 'Undergraduate', 'Postgraduate', 'All Levels'
        scheme_type TEXT NOT NULL, -- 'Merit-Based', 'Need-Based', 'Girls Only', 'Minority', 'SC/ST/OBC'
        income_ceiling_annual INTEGER, -- In INR
        min_marks_percent REAL,
        description TEXT NOT NULL,
        general_eligibility TEXT NOT NULL,
        required_documents TEXT NOT NULL,
        official_url TEXT NOT NULL,
        last_verified_date TEXT NOT NULL,
        is_demo INTEGER DEFAULT 0,
        application_status TEXT DEFAULT 'Open (Tentative / Demo)'
    );
    """)

    # 5. Online Official Document Portals
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS online_portals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL, -- 'Identity & Aadhaar', 'Academic & Digilocker', 'State e-District', 'Scholarship Portals'
        state TEXT NOT NULL DEFAULT 'All India',
        description TEXT NOT NULL,
        url TEXT NOT NULL,
        badge_text TEXT DEFAULT 'Official Portal'
    );
    """)

    # 6. Government Document Services (Guides)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gov_services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        purpose TEXT NOT NULL,
        typical_docs TEXT NOT NULL,
        step_by_step_guide TEXT NOT NULL,
        portal_name TEXT NOT NULL,
        portal_url TEXT NOT NULL,
        fee_and_processing_note TEXT NOT NULL,
        sample_state_examples TEXT NOT NULL
    );
    """)

    # 7. Notifications Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER, -- Null means global notification for all students
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        category TEXT NOT NULL, -- 'announcement', 'reminder', 'deadline', 'scheme'
        is_demo INTEGER DEFAULT 1,
        is_read INTEGER DEFAULT 0,
        published_date TEXT NOT NULL,
        link_url TEXT
    );
    """)

    # 8. Eligibility Check Records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS eligibility_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        scheme_id INTEGER,
        scheme_name TEXT NOT NULL,
        input_data TEXT NOT NULL, -- JSON string
        result_status TEXT NOT NULL, -- 'eligible', 'conditional', 'ineligible', 'insufficient'
        conditions_summary TEXT NOT NULL, -- JSON string of condition breakdown
        checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    """)

    conn.commit()
    seed_data(conn)
    conn.close()


def seed_data(conn):
    """Populates initial verified government schemes, portals, guides, and notifications."""
    cursor = conn.cursor()

    # Seed Schemes if empty
    cursor.execute("SELECT COUNT(*) as count FROM schemes")
    if cursor.fetchone()['count'] == 0:
        schemes = [
            (
                'NSP-CSSS',
                'Central Sector Scheme of Scholarships for College and University Students (CSSS)',
                'Central Govt',
                'Department of Higher Education, Ministry of Education, Govt of India',
                'Undergraduate',
                'Merit-Based',
                450000,
                80.0,
                'Provides financial assistance to meritorious students from low-income families to pursue higher studies in recognized colleges/universities.',
                'Above 80th percentile in relevant stream in Class XII / Equivalent State Board. Family income not exceeding Rs. 4.50 Lakh per annum. Regular (full-time) UG course.',
                'Class 12 Marksheet, Aadhaar Card, Income Certificate, College Admission Enrolment/Bonafide Certificate, Bank Passbook (Aadhaar Seeded)',
                'https://scholarships.gov.in',
                'October 2026',
                0,
                'Official Portal Available'
            ),
            (
                'POST-MATRIC-SC',
                'Post Matric Scholarship Scheme for SC Students',
                'Central Govt',
                'Ministry of Social Justice and Empowerment, Govt of India',
                'All Levels',
                'SC/ST/OBC',
                250000,
                0.0,
                'Centrally sponsored scheme to support Scheduled Caste students studying at post-matriculation or post-secondary stage.',
                'Student must belong to Scheduled Caste (SC). Enrolled in recognized post-matric course. Annual family income must not exceed Rs. 2.50 Lakh.',
                'Caste Certificate, Income Certificate from competent authority, Previous Qualifying Exam Marksheet, Current Fee Receipt, Bank Details',
                'https://scholarships.gov.in',
                'October 2026',
                0,
                'State / Central Portals Active'
            ),
            (
                'POST-MATRIC-OBC',
                'Post Matric Scholarship for OBC / EBC / DNT Students (PM-YASASVI)',
                'Central Govt',
                'Ministry of Social Justice and Empowerment, Govt of India',
                'All Levels',
                'SC/ST/OBC',
                250000,
                0.0,
                'Aims to provide financial support to OBC, EBC, and DNT students pursuing education at post-secondary level in India.',
                'Belonging to Other Backward Classes (OBC) / Economically Backward Classes (EBC). Annual parental income ceiling of Rs. 2.50 Lakh.',
                'OBC/EBC Certificate, Income Certificate, Marksheet, College Bonafide, Bank Account details',
                'https://scholarships.gov.in',
                'October 2026',
                0,
                'Official Portal Available'
            ),
            (
                'AICTE-PRAGATI',
                'AICTE Pragati Scholarship Scheme for Girl Students',
                'Central Govt',
                'All India Council for Technical Education (AICTE), Ministry of Education',
                'Undergraduate',
                'Girls Only',
                800000,
                0.0,
                'Empowers young women to pursue technical education (Degree or Diploma) in AICTE-approved institutions with Rs. 50,000 per annum contingency.',
                'Female students admitted to 1st year of Degree/Diploma course in an AICTE approved institution. Maximum two girls per family. Family income below Rs. 8 Lakh/year.',
                'AICTE Admission Allotment Letter, Class 10 & 12 Marksheet, Family Income Certificate, Aadhaar Card, Bank Passbook, Tuitions Fee Receipt',
                'https://www.aicte-india.org/schemes/students-development-schemes/pragati',
                'October 2026',
                0,
                'Annual AICTE Announcement'
            ),
            (
                'UGC-ISHAN-UDAY',
                'Ishan Uday Special Scholarship Scheme for North Eastern Region (NER)',
                'Central Govt',
                'University Grants Commission (UGC), Ministry of Education',
                'Undergraduate',
                'Need-Based',
                450000,
                0.0,
                'Promotes higher education among students from the North Eastern States (Assam, Arunachal, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura).',
                'Domicile of NER. Passed Class 12 or equivalent. Admitted into general degree, technical, or professional course in recognized universities/colleges. Income ceiling Rs. 4.5 Lakh.',
                'Permanent Resident Certificate (PRC) / Domicile of NER State, Income Certificate, Class 12 Marksheet, College Admission Proof, Bank Account',
                'https://www.ugc.gov.in',
                'October 2026',
                0,
                'Official Portal Available'
            ),
            (
                'DST-INSPIRE',
                'INSPIRE Scholarship for Higher Education (SHE)',
                'Central Govt',
                'Department of Science & Technology (DST), Ministry of Science & Technology',
                'Undergraduate',
                'Merit-Based',
                0,
                85.0,
                'Offered to meritorious students pursuing Natural and Basic Sciences (B.Sc., B.S., Integrated M.Sc.) to foster scientific research aptitude.',
                'Top 1% rank in Class XII board examination or competitive national ranks in JEE/NEET/KVPY pursuing Natural or Basic Sciences.',
                'Class 12 Marksheet & Board Advisory Note, Admission Proof in B.Sc./Integrated M.Sc., Endorsement Form by College Principal, SBI Bank Account',
                'https://online-inspire.gov.in',
                'October 2026',
                0,
                'Official Portal Active'
            ),
            (
                'RELIANCE-UG',
                'Reliance Foundation Undergraduate Scholarships',
                'Private/CSR',
                'Reliance Foundation',
                'Undergraduate',
                'Merit-Based',
                1500000,
                60.0,
                'Supports first-year undergraduate students across any stream with grants up to Rs. 2 Lakh over the course of their degree program.',
                'First-year full-time undergraduate students with minimum 60% in Class 12. Household income up to Rs. 15 Lakh (preference given to < Rs. 2.5 Lakh). Aptitude test required.',
                'Class 12 Marksheet, College Admission Proof, Family Income Proof, Government ID Proof, Passport Photo',
                'https://www.scholarships.reliancefoundation.org',
                'October 2026',
                1,
                'Demonstration / CSR Record'
            ),
            (
                'TATA-TRUSTS',
                'Tata Trusts Means Grant and Merit Scholarship',
                'Private/CSR',
                'Tata Trusts Education Division',
                'All Levels',
                'Need-Based',
                400000,
                60.0,
                'Need-based tuition fee assistance for students pursuing undergraduate, postgraduate, or healthcare studies in India.',
                'Enrolled in recognized Indian college. Genuine financial constraint with verifiable annual family income below Rs. 4 Lakh. Consistent academic track record.',
                'Income Certificate, College Fee Structure & Receipt, Previous Year Marksheets, Bonafide Letter, Identity Proof',
                'https://www.tatatrusts.org',
                'October 2026',
                1,
                'Demonstration / CSR Record'
            )
        ]
        cursor.executemany("""
        INSERT INTO schemes (
            code, name, provider_type, ministry_or_dept, education_level,
            scheme_type, income_ceiling_annual, min_marks_percent, description,
            general_eligibility, required_documents, official_url, last_verified_date,
            is_demo, application_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, schemes)

    # Seed Portals if empty
    cursor.execute("SELECT COUNT(*) as count FROM online_portals")
    if cursor.fetchone()['count'] == 0:
        portals = [
            (
                'DigiLocker India',
                'Academic & Digilocker',
                'All India',
                'Flagship initiative of MeitY providing digital access to verified Aadhaar, CBSE/State Marksheets, Driving License, and Degree certificates.',
                'https://www.digilocker.gov.in',
                'Govt Verified'
            ),
            (
                'National Scholarship Portal (NSP)',
                'Scholarship Portals',
                'All India',
                'One-stop electronic platform created by MeitY and Ministry of Education for end-to-end processing of Central and State government scholarships.',
                'https://scholarships.gov.in',
                'Central Official'
            ),
            (
                'Academic Bank of Credits (ABC / APAAR ID)',
                'Academic & Digilocker',
                'All India',
                'Platform established by UGC under NEP 2020 to digitally deposit, transfer, and store student academic credits and APAAR Student IDs.',
                'https://www.abc.gov.in',
                'Govt Verified'
            ),
            (
                'UIDAI Aadhaar Self Service Portal',
                'Identity & Aadhaar',
                'All India',
                'Official UIDAI portal to verify Aadhaar number validity, verify linked mobile/email, check bank seeding status, and download e-Aadhaar.',
                'https://myaadhaar.uidai.gov.in',
                'Govt Verified'
            ),
            (
                'UMANG (Unified Mobile App for New-age Governance)',
                'State e-District',
                'All India',
                'Single platform accessing thousands of Central and State Government citizen services including scholarship tracking and certificate lookups.',
                'https://web.umang.gov.in',
                'Govt Verified'
            ),
            (
                'Income Tax e-Filing Portal (PAN Services)',
                'Identity & Aadhaar',
                'All India',
                'Official portal of the Income Tax Department for instant e-PAN generation, PAN-Aadhaar linking, and financial verification.',
                'https://eportal.incometax.gov.in',
                'Govt Verified'
            ),
            (
                'Uttar Pradesh e-District Portal',
                'State e-District',
                'Uttar Pradesh',
                'Citizen service portal of Uttar Pradesh for online application of Income, Caste, Domicile, and Birth certificates.',
                'https://edistrict.up.gov.in',
                'State Portal'
            ),
            (
                'Aaple Sarkar (Maharashtra Citizen Portal)',
                'State e-District',
                'Maharashtra',
                'Single window delivery portal for Revenue, Social Justice, and Higher Education services in Maharashtra.',
                'https://aaplesarkar.mahaonline.gov.in',
                'State Portal'
            ),
            (
                'Seva Sindhu (Karnataka Service Portal)',
                'State e-District',
                'Karnataka',
                'Karnataka government portal for issuing caste certificates, income certificates, and resident certificates online.',
                'https://sevasindhu.karnataka.gov.in',
                'State Portal'
            ),
            (
                'e-District West Bengal',
                'State e-District',
                'West Bengal',
                'Official portal for issuance of digital Domicile, Income, and OBC certificates in West Bengal.',
                'https://edistrict.wb.gov.in',
                'State Portal'
            ),
            (
                'ServicePlus (National Multi-State e-Governance)',
                'State e-District',
                'Multiple States',
                'National Informatics Centre (NIC) electronic service delivery framework used by Bihar, Jharkhand, Odisha, Assam, and other states for certificate issuance.',
                'https://serviceonline.gov.in',
                'NIC Official'
            )
        ]
        cursor.executemany("""
        INSERT INTO online_portals (name, category, state, description, url, badge_text)
        VALUES (?, ?, ?, ?, ?, ?)
        """, portals)

    # Seed Government Document Services Guides
    cursor.execute("SELECT COUNT(*) as count FROM gov_services")
    if cursor.fetchone()['count'] == 0:
        gov_services = [
            (
                'Income Certificate (Aay Praman Patra)',
                'income-certificate',
                'Financial Certificates',
                'Authenticates annual family or parental income from all sources. Essential for applying to need-based scholarships, fee concessions, and quota verifications.',
                'Aadhaar card of parent & student, Salary slips / Form 16 / ITR or self-declaration affidavit, Ration card / Electricity bill for address proof, Passport photo.',
                '1. Identify your state citizen portal (e.g. eDistrict UP, Aaple Sarkar, Seva Sindhu, or ServicePlus).\n2. Register citizen account with mobile number and Aadhaar.\n3. Navigate to Revenue / Tehsildar Services > Issue of Income Certificate.\n4. Fill family details, annual income from agriculture/salary/business.\n5. Upload address proof, identity proof, and income affidavit.\n6. Submit and note the Application Tracking Number (ACK).\n7. Application is verified by Revenue Inspector/Talathi and approved by Tehsildar/Sub-Divisional Magistrate (SDM).\n8. Download digitally signed certificate once status changes to Approved.',
                'State e-District / ServicePlus Portal',
                'https://serviceonline.gov.in',
                'Processing time usually 7 to 15 working days. Nominal government portal fee of Rs. 15 to Rs. 50 applies in most states. Valid for 1 to 3 financial years depending on state rules.',
                'UP: edistrict.up.gov.in | MH: aaplesarkar.mahaonline.gov.in | KA: sevasindhu.karnataka.gov.in | WB: edistrict.wb.gov.in'
            ),
            (
                'Caste / Community Certificate (Jati Praman Patra)',
                'caste-certificate',
                'Reservation & Category',
                'Confirms the applicant belongs to Scheduled Caste (SC), Scheduled Tribe (ST), or Other Backward Classes (OBC). Mandatory for category-specific scholarships and fee waivers.',
                'Aadhaar card, Father or blood relative caste proof (old land revenue record, school transfer certificate showing caste), Ration card / domicile proof, Self-declaration.',
                '1. Visit State e-District portal or local CSC (Common Service Centre) Jan Seva Kendra.\n2. Select Revenue or Social Welfare Department > Caste Certificate.\n3. Enter applicant details, caste name, sub-caste, and paternal lineage evidence.\n4. Upload ancestral caste proof, school leaving certificate of father/applicant, and photo.\n5. Submit application and pay nominal service fee.\n6. Verification conducted by Revenue Officer (Tehsildar / Mandal Revenue Officer).\n7. Download digitally signed certificate or collect hard copy from Tehsil office.',
                'State e-District / Social Welfare Portal',
                'https://serviceonline.gov.in',
                'Processing time typically 15 to 30 days. SC/ST certificates generally have lifetime validity; OBC certificates may need regular renewal of income status (Non-Creamy Layer).',
                'UP: edistrict.up.gov.in | Bihar: serviceonline.bihar.gov.in | Rajasthan: emitra.rajasthan.gov.in | TN: tnesevai.tn.gov.in'
            ),
            (
                'Domicile / Residence Certificate (Nivas Praman Patra)',
                'domicile-certificate',
                'Residence Proof',
                'Proves that a person has been residing in a particular state or union territory continuously for the period stipulated by state laws (often 5 to 15 years). Required for state-funded scholarships and domicile-quota seats.',
                'Continuous residence proof (Electricity/Water bills spanning minimum required years, Voter ID, Land registry / House rent agreement), School schooling certificates, Aadhaar card.',
                '1. Access your state government public service portal.\n2. Go to Revenue Department > Issuance of Domicile / Residence Certificate.\n3. Fill in continuous years of residence in the state, educational background in local institutions.\n4. Attach local school transfer certificates (e.g. 5th, 10th, 12th marksheet from the state) and residence proofs.\n5. Pay fee and obtain acknowledgment slip.\n6. Local revenue inquiry is completed by Patwari/Lekhpal.\n7. Approved certificate can be verified and downloaded online.',
                'State Citizen Portal / e-District',
                'https://serviceonline.gov.in',
                'Processing time 10 to 20 days. Domicile certificates typically have lifelong validity unless otherwise specified by state circulars.',
                'MP: mpedistrict.gov.in | Delhi: edistrict.delhigovt.nic.in | Odisha: edistrict.odisha.gov.in | Punjab: connect.punjab.gov.in'
            ),
            (
                'Non-Creamy Layer (NCL) Certificate for OBC',
                'obc-ncl-certificate',
                'Reservation & Category',
                'Validates that an OBC candidate does not fall under the Creamy Layer (parental annual gross income below Rs. 8 Lakh ceiling, excluding agricultural income as per DoPT guidelines). Essential for Central & State OBC quota scholarships.',
                'Existing OBC Caste Certificate, 3 consecutive years Income Tax Returns or Income Certificates of parents, Form 16 / Salary slips, Aadhaar card.',
                '1. Apply via State e-District portal or Sub-Divisional Magistrate (SDM) office.\n2. Choose Non-Creamy Layer OBC Certificate Service.\n3. Submit parental employment details (Group A/B/C/D status, private employment, agriculture details).\n4. Attach 3-year income proofs and caste verification document.\n5. Revenue officer calculates eligibility according to Department of Personnel and Training (DoPT) norms.\n6. Receive certified NCL certificate with official digital signature.',
                'Sub-Divisional Magistrate / e-District',
                'https://serviceonline.gov.in',
                'Strictly valid for the relevant financial year (April 1 to March 31). Must be renewed annually for scholarship portals like NSP.',
                'All States via Revenue Department / District Administration portals'
            ),
            (
                'DigiLocker Academic Documents & Marksheets',
                'digilocker-documents',
                'Academic & Digilocker',
                'Enables instant, authentic download of 10th, 12th marksheets, passing certificates, and university degrees with legal parity to original physical documents under IT Act 2000.',
                'Aadhaar registered mobile number (for OTP verification), Roll number, Passing year, and Board/University name.',
                '1. Open digilocker.gov.in or install official DigiLocker app.\n2. Sign in or sign up using your Aadhaar number and OTP.\n3. Go to Search Documents > Education & Learning.\n4. Search for your Education Board (CBSE, CISCE, State Board, NIOS, or University).\n5. Select Marksheet or Passing Certificate.\n6. Enter Roll Number, Admit Card ID, or Year of Examination.\n7. Click "Get Document" — the digitally signed PDF is stored in your "Issued Documents" tab and can be shared directly with scholarship authorities.',
                'DigiLocker India Portal',
                'https://www.digilocker.gov.in',
                'Completely free of charge. Instant download available 24/7. Verified digital signature embedded directly on the document.',
                'Available nationwide for all CBSE, CISCE, and over 45 State Boards & 500+ Universities'
            )
        ]
        cursor.executemany("""
        INSERT INTO gov_services (
            service_name, slug, category, purpose, typical_docs,
            step_by_step_guide, portal_name, portal_url, fee_and_processing_note,
            sample_state_examples
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, gov_services)

    # Seed Notifications if empty
    cursor.execute("SELECT COUNT(*) as count FROM notifications")
    if cursor.fetchone()['count'] == 0:
        demo_notifications = [
            (
                None,
                'National Scholarship Portal (NSP) AY 2026-27 Guidelines Announced',
                'The Ministry of Education has released standard operating procedures for Aadhaar Face-RD biometric authentication and Institute Nodal Officer (INO) verification. Students are advised to keep Aadhaar seeded with bank accounts.',
                'announcement',
                1,
                0,
                '2026-10-25',
                'https://scholarships.gov.in'
            ),
            (
                None,
                'Reminder: Income Certificate Renewal for Financial Year 2026-27',
                'Most state and central scholarship schemes require an Income Certificate issued after April 1, 2026. Please check your certificate validity to avoid last-minute portal rejection.',
                'reminder',
                1,
                0,
                '2026-10-28',
                '/government-document-services'
            ),
            (
                None,
                'DigiLocker Direct Verification Integration Advisory',
                'You can now pull your Class 10 and 12 digital marksheets directly via DigiLocker. Verify your name spelling matches exactly with your Aadhaar record.',
                'scheme',
                1,
                0,
                '2026-10-29',
                '/online-document-sites'
            ),
            (
                None,
                'Tentative Deadline: Post-Matric SC/ST Schemes (Demonstration Notice)',
                'Sample timeline notice: State portals typically open verification windows in Q3/Q4. Ensure your College Bonafide and Current Fee Receipts are scanned and ready.',
                'deadline',
                1,
                0,
                '2026-10-30',
                '/documents-need'
            )
        ]
        cursor.executemany("""
        INSERT INTO notifications (student_id, title, message, category, is_demo, is_read, published_date, link_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, demo_notifications)

    conn.commit()


def get_default_checklist_templates(course, scholarship_interest):
    """
    Returns standard document requirements tailored to student level and scholarship choice.
    Distinguishes Mandatory, Optional, and Scheme-Dependent items.
    """
    is_school = 'School' in course
    is_ug = 'Undergraduate' in course or 'Diploma' in course
    is_pg = 'Postgraduate' in course or 'PhD' in course

    base_items = [
        {
            'doc_key': 'aadhaar_card',
            'title': 'Aadhaar Card / Government Identity Proof',
            'category': 'Identity',
            'is_mandatory': 1,
            'why_needed': 'Mandatory primary identity verification and Direct Benefit Transfer (DBT) Aadhaar-seeding compliance.',
            'official_portal_name': 'UIDAI myAadhaar',
            'official_portal_url': 'https://myaadhaar.uidai.gov.in'
        },
        {
            'doc_key': 'passport_photo',
            'title': 'Recent Passport-size Photograph',
            'category': 'Identity',
            'is_mandatory': 1,
            'why_needed': 'Required for application form profile identification (usually clear white or light background, under 100KB).',
            'official_portal_name': None,
            'official_portal_url': None
        },
        {
            'doc_key': 'student_signature',
            'title': 'Student Specimen Signature',
            'category': 'Identity',
            'is_mandatory': 1,
            'why_needed': 'Black or blue ink signature on clean white paper for digital upload and authentication.',
            'official_portal_name': None,
            'official_portal_url': None
        },
        {
            'doc_key': 'previous_marksheet',
            'title': 'Previous Examination Marksheet (10th / 12th / Last Semester)',
            'category': 'Academic',
            'is_mandatory': 1,
            'why_needed': 'Verifies academic performance and minimum eligibility marks criteria established by the scholarship provider.',
            'official_portal_name': 'DigiLocker Academic',
            'official_portal_url': 'https://www.digilocker.gov.in'
        },
        {
            'doc_key': 'bonafide_certificate',
            'title': 'College / School Bonafide Certificate',
            'category': 'Institutional',
            'is_mandatory': 1,
            'why_needed': 'Official certificate signed and stamped by Head of Institution / Principal confirming active regular enrolment.',
            'official_portal_name': None,
            'official_portal_url': None
        },
        {
            'doc_key': 'current_fee_receipt',
            'title': 'Current Academic Year Fee Receipt',
            'category': 'Financial',
            'is_mandatory': 1,
            'why_needed': 'Proof of fee payment used to disburse course fee reimbursement and contingency allowances.',
            'official_portal_name': None,
            'official_portal_url': None
        },
        {
            'doc_key': 'bank_passbook',
            'title': 'Bank Passbook / Cancelled Cheque (Aadhaar Seeded)',
            'category': 'Financial',
            'is_mandatory': 1,
            'why_needed': 'Direct DBT transfer into active student account. Must clearly show Account Number, IFSC code, and Student Name.',
            'official_portal_name': 'NPCI Aadhaar Seeding Check',
            'official_portal_url': 'https://www.npci.org.in'
        },
        {
            'doc_key': 'income_certificate',
            'title': 'Competent Authority Income Certificate',
            'category': 'Financial',
            'is_mandatory': 1 if 'Need' in scholarship_interest or 'Post-Matric' in scholarship_interest else 0,
            'why_needed': 'Proves household annual income is within the mandated ceiling (issued by Tehsildar/SDM/Revenue Officer).',
            'official_portal_name': 'State e-District / ServicePlus',
            'official_portal_url': 'https://serviceonline.gov.in'
        },
        {
            'doc_key': 'domicile_certificate',
            'title': 'Domicile / Permanent Resident Certificate (PRC)',
            'category': 'Institutional',
            'is_mandatory': 0,
            'why_needed': 'Mandatory for State government scholarship schemes or regional schemes like Ishan Uday (NER).',
            'official_portal_name': 'State e-District Portal',
            'official_portal_url': 'https://serviceonline.gov.in'
        },
        {
            'doc_key': 'caste_certificate',
            'title': 'Caste / Community Certificate (SC / ST / OBC / EBC)',
            'category': 'Reservation',
            'is_mandatory': 1 if 'SC' in scholarship_interest or 'OBC' in scholarship_interest else 0,
            'why_needed': 'Mandatory if applying under reserved categories (SC, ST, OBC) or specific affirmative action schemes.',
            'official_portal_name': 'State e-District / Social Welfare',
            'official_portal_url': 'https://serviceonline.gov.in'
        },
        {
            'doc_key': 'apaar_abc_id',
            'title': 'APAAR / Academic Bank of Credits (ABC) ID',
            'category': 'Academic',
            'is_mandatory': 1 if (is_ug or is_pg) else 0,
            'why_needed': '12-digit unique national student identifier used for higher education credit tracking and scholarship validation.',
            'official_portal_name': 'Academic Bank of Credits',
            'official_portal_url': 'https://www.abc.gov.in'
        },
        {
            'doc_key': 'scholarship_application_form',
            'title': 'Signed Scholarship Application Acknowledgement Form',
            'category': 'Application',
            'is_mandatory': 0,
            'why_needed': 'Downloaded summary printout submitted to the college Nodal Officer along with attached self-attested documents.',
            'official_portal_name': 'National Scholarship Portal',
            'official_portal_url': 'https://scholarships.gov.in'
        }
    ]

    return base_items


def initialize_student_checklist(student_id, course, scholarship_interest):
    """Generates initial checklist items for a newly registered student."""
    items = get_default_checklist_templates(course, scholarship_interest)
    conn = get_db()
    cursor = conn.cursor()

    for item in items:
        cursor.execute("""
        INSERT INTO checklist_items (
            student_id, doc_key, title, category, is_mandatory,
            why_needed, status, official_portal_name, official_portal_url
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
        """, (
            student_id, item['doc_key'], item['title'], item['category'],
            item['is_mandatory'], item['why_needed'],
            item['official_portal_name'], item['official_portal_url']
        ))

    conn.commit()
    conn.close()
