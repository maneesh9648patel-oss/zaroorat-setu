# ZarooratSetu (ज़रूरतसेतु)
> **"The right support for every need."**  
> *HackFest 3.0 · Open Innovation / Civic Tech · Pilot: REC Banda & Surrounding Areas*

A low-cost, mobile-first community resource network connecting individuals in urgent need with verified local donors, resource lenders, and NGOs. Built specifically for semi-urban and rural settings like Banda, featuring voice input, text-to-speech readouts, human-in-the-loop AI prioritization, and anti-fraud single-use QR handovers.

---

## 📱 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, `qrcode.react`, `html5-qrcode`.
- **Backend**: Node.js, Express (REST API), Helmet, CORS, Express-Rate-Limit.
- **Database & Auth**: Firestore (with zero-dependency local JSON file/memory mock mode via `VITE_MOCK=true` and `MOCK_FIREBASE=true`).
- **AI Engine**: Google Gemini API (`gemini-1.5-flash`), invoked **strictly backend-only** with rule-based offline fallback.
- **Voice Accessibility**: Web Speech API (`SpeechRecognition` with Hindi `hi-IN` & `en-IN`, plus `speechSynthesis` for low-literacy readout).
- **Design & Typography**: Nunito font, rounded cards, tap targets $\ge 48\text{px}$, warm NGO palette:
  - Terracotta: `#B8400E`
  - Teal: `#1F7A6B`
  - Cream: `#FAF1E4`
  - Dark Brown: `#2B1B10`
  - Soft Yellow: `#F4D79A`

---

## 🚀 Quick Start (Unified Single Server)

The application combines both the frontend and backend into a single unified server running on **`http://localhost:5000`**.

### 1. One-Click Launch (Windows)
Double-click `start_zarooratsetu.bat` at the root of the project, or run:
```cmd
start_zarooratsetu.bat
```

### 2. Manual Commands
From the project root:
```powershell
# Start unified full-stack server (Frontend + Backend API)
node server.js
```
- **Website UI**: [http://localhost:5000](http://localhost:5000)
- **API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Demo Phone OTP**: `123456`

---

## 🧪 Automated Test Suite

We maintain unit test suites for security, OTP auth, single-use QR, and duplicate detection:
```powershell
cd server
npm test
```
**Test Coverage (16/16 tests passing)**:
1. `authOtp.test.js`: Phone formatting, demo OTP `123456`, rate limiting, tiered KYC assignment (`"Basic verified"`).
2. `duplicateDetection.test.js`: Fuzzy text similarity, category/user matching, 72-hour sliding window check.
3. `qrHandover.test.js`: HMAC token generation, single-use invalidation, replay rejection, anti-spoofing (screenshot alone without matching authenticated account is rejected).

---

## 👥 Seed Demo Personas (Banda Region)

Use the persona dropdown in the top navigation bar to switch identities instantaneously:

| Persona | Role | Location | Verification Tier |
|---|---|---|---|
| **Aarav Kumar** | Needer (`needer`) | Civil Lines, Banda | Level 1: Basic verified |
| **Seva Sahayata Trust** | Verified NGO (`ngo`) | Civil Lines, Banda | Level 3: NGO Verified (`UP/2021/BND/0042`) |
| **Priya Verma** | Blood & Item Donor (`donor`) | District Hospital Banda | Level 2: ID Verified |
| **Manoj Tripathi** | Human Reviewer (`verifier`) | REC Banda Campus | Level 2: Reviewer Verified |
| **Platform Admin** | Administrator (`admin`) | REC Banda | Level 3: Full Governance |

> **Demo Phone OTP**: Enter any 10-digit number; demo OTP is **`123456`**.

---

## 📋 Working vs Mocked/Planned Matrix (Honesty Checklist)

| Feature | Implementation Status | User-Facing Disclosure |
|---|---|---|
| **Phone OTP Verification** | **Real** (Firebase Auth ready + local mock code `123456`) | Labeled "Demo mode" in offline testing |
| **Tiered KYC Badges** | **Real** (Enforced in middleware & context) | Labeled `"Basic verified"` (never called "Complete KYC") |
| **Government ID / Aadhaar** | **Placeholder Interface** | Labeled *"Additional verification (as per applicable rules and authorized integration) - Coming soon"* |
| **Duplicate Detection** | **Real** (Jaccard tokenized similarity + temporal window) | Flags duplicates in human verifier panel |
| **AI Priority Engine** | **Real** (Backend Gemini API + Deterministic Rule Fallback) | Discloses: *"AI only suggests. A human verifier makes the final decision."* |
| **Voice Speech-to-Text** | **Real** (Browser Web Speech API `hi-IN` & `en-IN`) | Visual listening pulse with fallback to typing |
| **Voice Text-to-Speech** | **Real** (Browser `speechSynthesis` in Hindi) | One-tap audio readout for low literacy |
| **Single-Use Handover QR** | **Real** (Cryptographic HMAC token, single-use invalidation) | Invalidation on first scan; replay rejected |
| **Geo-Distance Matcher** | **Real** (Haversine formula across Banda pilot coordinates) | Live distance calculation in km |
| **Offline Missed-Call & SMS** | **Simulated Webhook & Volunteer Desk** | Labeled *"Planned / Future Architecture"* |
| **Payments / UPI / Cards** | **Explicitly Omitted in v1** | Zero card or UPI PIN data stored anywhere |

---

## 🔒 Privacy & Security Rules

1. **Zero Public Phone/Address Exposure**: The public requests feed and matching endpoints only project `publicName` (e.g., *Aarav K.*) and `area` (e.g., *Civil Lines, Banda*). Full phone numbers and private addresses are encrypted at rest and never transmitted over public endpoints.
2. **Single-Use QR Handover**: A screenshot alone is rejected because the scanner endpoint simultaneously verifies the logged-in user session against the assigned lender record and immediately marks the token `used`.
3. **Human-in-the-Loop**: The AI priority engine calculates a suggested score ($1.0 - 10.0$) and rationale, but requests remain in `pending` status until an authorized human verifier explicitly clicks **Approve**.

---

## 📜 Pilot Area & Locations

- **REC Banda**: Rajkiya Engineering College, Atarra Road, Banda (Lat: 25.5348, Lng: 80.3478)
- **Civil Lines**: Central residential & commercial cluster (Lat: 25.4764, Lng: 80.3344)
- **District Hospital**: Medical corridor & blood bank (Lat: 25.4810, Lng: 80.3410)
- **Baberu, Atarra, Tindwari, Naraini**: Surrounding tehsil clusters
