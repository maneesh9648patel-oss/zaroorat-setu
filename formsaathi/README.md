# FormSaathi — Smart Scholarship & Government Document Assistant

FormSaathi is a modern, professional, mobile-responsive web platform built specifically for Indian students across school, diploma, undergraduate, and postgraduate levels. It helps students understand complex scholarship requirements, check their eligibility against authentic criteria, organize their application documents privately, explore Central/State/CSR schemes, and navigate to authorized government portals for obtaining essential certificates online.

---

## 1. Technology Stack

- **Backend Logic:** Python 3.10+ / 3.12 with **Flask** framework
- **Templating Engine:** Jinja2
- **Database:** SQLite (persisted in `instance/formsaathi.db` with relational integrity)
- **Frontend Presentation:** Modern Semantic HTML5, CSS3 Custom Properties (Design System)
- **Client Interactions:** Vanilla JavaScript (minimal, high performance, accessible)
- **Iconography:** Font Awesome 6.5.1 (Free CDN)
- **Design Theme:** Professional Indian-GovTech palette with deep navy `#1e3a8a`, royal blue `#2563eb`, teal accents `#0d9488`, slate neutrals, soft cards, subtle shadows, and clear typography.

---

## 2. Project Architecture & Directory Structure

```text
formsaathi/
│
├── app.py                      # Core Flask application, controllers & routing logic
├── models.py                   # SQLite schema definitions, data models & seeding
├── requirements.txt            # Python dependencies
├── run.py                      # Local development startup launcher
├── run.bat                     # Windows one-click batch launcher
├── test_app.py                 # Automated test suite (Unit & Integration tests)
├── README.md                   # Complete documentation and setup manual
│
├── instance/
│   └── formsaathi.db           # SQLite database (auto-generated on first launch)
│
├── uploads/                    # Private local storage for student documents
│   └── <student_id>/           # Isolated per student; protected from public static access
│
├── static/
│   ├── css/
│   │   └── style.css           # Complete responsive stylesheet & print optimization
│   └── js/
│       └── app.js              # Client scripts: drawer, status AJAX, preview modals
│
└── templates/
    ├── base.html               # Main layout skeleton, sidebar & top navigation
    ├── welcome.html            # First Page: Student Information Setup onboarding
    ├── home.html               # Home dashboard with announcements ticker & cards
    ├── documents_need.html     # Personalized document requirements checklist
    ├── my_documents.html       # Secure private document repository & preview
    ├── dashboard.html          # Student preparation summary, progress & recent alerts
    ├── eligibility.html        # Rule-based scholarship eligibility checker
    ├── online_sites.html       # Directory of verified official government portals
    ├── notifications.html      # Notifications & reminders center
    ├── schemes.html            # Searchable Central, State & CSR schemes directory
    ├── government_services.html# Step-by-step guides for Income, Caste, Domicile, etc.
    ├── edit_profile.html       # Profile management and update form
    └── error.html              # Custom error pages (400, 403, 404, 500)
```

---

## 3. Key Features & Sections

### 1. Student Information Setup (`/welcome`)
- Clean, welcoming onboarding experience for first-time visitors.
- Collects: Full Name, Email, Course level (School, Diploma, UG, PG, PhD, or custom), Institution Name, Target Scholarship Scheme, Academic Year, State, and Category.
- Strict privacy: **Never asks for passwords, Aadhaar numbers, OTPs, or bank account credentials.**
- Automatically seeds the student's tailored document checklist upon registration.

### 2. Main Dashboard & Navigation
- Modern desktop sidebar and mobile slide-out drawer navigation with FormSaathi branding.
- Quick student badge with active course and institute.
- Accessible keyboard-friendly controls and responsive layout across mobile, tablet, and desktop screens.

### 3. Home Section (`/home`)
- Horizontal scrolling announcement strip displaying application announcements, document prep reminders, and verified dates (with accessibility support for reduced motion and pause-on-hover).
- Personalized student greeting.
- 6 core feature cards and quick-action shortcut buttons.

### 4. Required Documents Checklist (`/documents-need`)
- Tailored specifically to the student's education level and target scheme.
- Clear distinction between **Mandatory**, **Optional**, and **Scheme-Dependent** requirements.
- "Why is this document needed?" context cards explaining official purpose.
- Links to official issuance or verification portals (e.g. DigiLocker, UIDAI, ServicePlus).
- Interactive status markers: **Ready**, **Pending**, and **Not Applicable (N/A)** with live progress bar.
- Category filtering and print-friendly view (`@media print` formatted for clean A4 printing).

### 5. My Documents — Secure Storage (`/my-documents`)
- Private digital vault to upload and organize application files (PDF, JPG, PNG up to 10MB).
- Security design: Files are stored outside the public `static` folder in student-isolated directories (`uploads/<student_id>/`).
- Served strictly via authenticated endpoints (`/documents/<id>/view` and `/documents/<id>/download`).
- In-browser preview modal for PDF and image documents.
- Student self-verification toggle ("Verified by Student" vs "Pending Review").
- Safe file deletion with disk cleanup.

### 6. Preparation Dashboard (`/dashboard`)
- Real-time statistics: Documents Ready count, Pending count, Checklist Completion percentage, and uploaded files count (calculated dynamically from actual database records).
- Latest eligibility check outcome summary.
- Recent notifications and portal shortcuts.

### 7. Scholarship Eligibility Checker (`/eligibility-checker`)
- Interactive advisory tool comparing user qualifications (course level, marks %, annual family income, domicile, category, gender) against configured scheme rules.
- Produces one of 4 exact, transparent outcomes:
  1. *Appears eligible based on the information provided*
  2. *May be eligible; additional conditions need checking*
  3. *One or more listed conditions are not met*
  4. *Insufficient information to determine eligibility*
- Shows a condition-by-condition breakdown (Passed / Not Met / Caution / Info).
- Direct link to the official scheme portal and mandatory disclaimer stating that final sanction belongs to the government authority.

### 8. Online Document Sites (`/online-document-sites`)
- Curated directory of verified government websites: DigiLocker, National Scholarship Portal (NSP), UMANG, UIDAI myAadhaar, Income Tax e-Filing (PAN), Academic Bank of Credits (ABC / APAAR ID), and State e-District portals (UP, Maharashtra, Karnataka, West Bengal, Bihar, etc.).
- State dropdown and category filter.
- Verified government links opening directly in new tabs with security rel attributes.

### 9. Notifications Center (`/notifications`)
- Timely reminders for scholarship windows, document preparation, and certificate renewals.
- Filter by All, Unread, or Read.
- Mark as read / mark as unread / mark all as read.
- Clear disclosure distinguishing **Confirmed Official** news from **Sample / Demonstration** notices.

### 10. Explore Schemes Directory (`/explore-schemes`)
- Searchable directory of Central Government, State Government, and CSR Philanthropic scholarships (e.g., NSP CSSS, Post-Matric SC/ST/OBC, AICTE Pragati for Girls, UGC Ishan Uday for NER, DST INSPIRE, Reliance Foundation, Tata Trusts).
- Multi-filtering by Education Level, Provider Type, and Scheme Type.
- Transparent cards showing eligibility summaries, required documents, official links, and last-verified dates.

### 11. Government Document Services — Apply Online (`/government-document-services`)
- Step-by-step guidance on how to obtain official certificates:
  - Income Certificate (*Aay Praman Patra*)
  - Caste / Community Certificate (*Jati Praman Patra*)
  - Domicile / Residence Certificate (*Nivas Praman Patra*)
  - Non-Creamy Layer (NCL) Certificate for OBC
  - DigiLocker Academic Certificates & Marksheets
- Each guide details: Purpose, commonly requested documents, step-by-step application workflow, state portal examples, fee and processing timeline advisories, and links to official portals.
- Clear disclaimer: FormSaathi does not issue certificates; issuance happens exclusively through authorized government portals.

---

## 4. Setup and Run Instructions (Local)

### Prerequisites
- Python 3.10, 3.11, or 3.12 installed.
- Pip package manager.

### Step 1: Clone / Navigate to Directory
```bash
cd c:\Users\manee\Downloads\UploadFromMobile\formsaathi
```

### Step 2: (Optional but Recommended) Create a Virtual Environment
```bash
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Windows Command Prompt:
.\venv\Scripts\activate.bat
```

### Step 3: Install Required Packages
```bash
pip install -r requirements.txt
```

### Step 4: Run the Application
You can run using any of the following methods:

**Method A: Using Python directly**
```bash
python app.py
```

**Method B: Using the runner script**
```bash
python run.py
```

**Method C: Windows Batch File**
Double-click `run.bat` or execute in terminal:
```cmd
run.bat
```

### Step 5: Access in Browser
Open your browser and navigate to:
```text
http://127.0.0.1:5000
```
On first launch, FormSaathi will automatically initialize `instance/formsaathi.db`, seed official government schemes, portals, and service guides, and open the Student Information Setup page.

---

## 5. Running Automated Tests

FormSaathi includes a comprehensive unit and integration test suite in `test_app.py` verifying onboarding, navigation across all 9 sections, checklist persistence, secure file uploads, download permissions, file deletion, eligibility rules, and notifications.

Run the test suite with:
```bash
python -m unittest test_app.py
```
Output:
```text
.........
----------------------------------------------------------------------
Ran 9 tests in 0.711s

OK
```

---

## 6. Deployment Instructions (Production)

To deploy FormSaathi to production environments (such as Render, Railway, PythonAnywhere, or an Ubuntu VPS):

### Deployment Configuration
1. **Environment Variables:**
   - `SECRET_KEY`: Set a cryptographically secure random string (e.g., generated with `python -c "import secrets; print(secrets.token_hex(32))"`).
   - `FLASK_ENV`: `production`
   - `PORT`: Usually injected automatically by hosting providers (defaults to `5000`).

2. **Production WSGI Server (Gunicorn):**
   Install Gunicorn:
   ```bash
   pip install gunicorn
   ```
   Run with:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

### Deploying to Render / Railway
1. Create a `Procfile` containing:
   ```text
   web: gunicorn app:app
   ```
2. Connect your Git repository.
3. Configure build command: `pip install -r requirements.txt`
4. Configure start command: `gunicorn app:app`
5. Attach a persistent disk mount for the `uploads/` and `instance/` folders if persistent user files across redeploys are required.

### Deploying to PythonAnywhere
1. Create a new Flask web app pointing to Python 3.10+.
2. Upload the `formsaathi/` files into `/home/<username>/formsaathi`.
3. In the WSGI configuration file, point to the application:
   ```python
   import sys
   path = '/home/<username>/formsaathi'
   if path not in sys.path:
       sys.path.append(path)
   from app import app as application
   ```

---

## 7. Current Features vs Future Official Integrations

| Feature Component | Current MVP Implementation | Future Enhancements with Official APIs |
| :--- | :--- | :--- |
| **Student Onboarding** | Dynamic student profiling with course, academic year, and category | Student Single-Sign-On (SSO) via DigiLocker MeriPehchaan |
| **Document Checklist** | Tailored interactive checklist with live progress tracking & print support | Automated sync with DigiLocker Issued Documents |
| **Document Vault** | Private, authenticated local storage with PDF/image preview & safe deletion | Direct cloud export to National Scholarship Portal (NSP) OTR |
| **Eligibility Checker** | Rule engine testing academic marks %, income ceilings, category & domicile | Direct eligibility lookup via Ministry API feeds |
| **Government Portals Directory** | Curated verified official portals with state and category filter | Live status ping to monitor government portal uptime |
| **Notifications Center** | In-app feed with verified circulars and clearly marked demonstration alerts | Webhook push notifications from state scholarship departments |
| **Document Guides** | Step-by-step guidance for Income, Caste, Domicile, and NCL certificates | Direct API tracking of application acknowledgment numbers (ACK) |

---

## 8. Transparency & Compliance Disclaimer

1. **Not a Government Website:** FormSaathi is an independent informational and student assistance platform. It does not claim to represent any government entity or ministry.
2. **No Fee Collection or Issuance:** FormSaathi does not issue government documents or certificates, nor does it collect application fees. All actual certificate issuances are processed through authorized government platforms.
3. **Privacy First:** FormSaathi strictly does not request or store sensitive credentials such as bank passwords, payment PINs, Aadhaar numbers, or OTPs.
4. **Demonstration Data:** Schemes and announcements that are based on historical patterns or demonstration models are visibly tagged with clear badges (*Sample / Demonstration Record*) to maintain complete honesty and prevent misinformation.

---
*FormSaathi — Dedicated to empowering Indian students with clarity, confidence, and organized scholarship preparation.*
