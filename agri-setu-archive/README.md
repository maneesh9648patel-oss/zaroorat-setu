# AGRI-SETU (एग्री-सेतु)
> **“Connecting Farmers to the Right Support”**  
> *Official Web Platform / Prototype for Smart India Hackathon 2026*  
> **Team:** Team Tech Titans  
> **Institution:** Rajkiya Engineering College, Banda (REC Banda)  
> **Focus Region:** Bundelkhand Agro-Climatic Zone (Banda, Uttar Pradesh) & Pan-India  

---

## 🌾 About Agri-Setu

**Agri-Setu** is a unified farmer discovery and action layer designed to eliminate the severe search friction Indian farmers face when navigating government schemes, agricultural advisories, mandi pricing, crop insurance, and Krishi Vigyan Kendra (KVK) scientist support.

### The Core Principle
> **“Government platforms deliver services. Agri-Setu helps farmers discover and act on the right service.”**

Agri-Setu **does not replace** official portals like PM-KISAN, PMFBY, e-NAM, or IMD. Instead, it acts as an intelligent, context-aware discovery bridge that ingests the farmer’s location, crop, soil, and specific problem, and instantly routes them to the right verified official service.

---

## 🔄 The 6-Step Farmer Journey

```
FARMER PROBLEM (Voice / Text / Photo)
       ↓
UNDERSTAND FARMER CONTEXT (Banda UP • Wheat • Rabi • Small Farmer)
       ↓
AI ASSISTANCE (Computer Vision Pathogen Recognition • 94.2% Yellow Rust)
       ↓
PERSONALIZED GUIDANCE (Targeted Crop Care • Rain Risk Advisory • Scheme Match)
       ↓
ACTION (Official Gateway: pmkisan.gov.in • pmfby.gov.in • e-NAM • KVK Banda)
       ↓
FOLLOW-UP (72-Hour Claim Window Alerts • SMS Deadlines • Spray Reminders)
```

---

## 🌟 Key Platform Capabilities

1. **AI Crop & Disease Assistance (Crop Doctor)**:
   - Diagnoses crop conditions via uploaded photos or realistic Bundelkhand presets (Wheat Yellow Rust, Leaf Blight, Mustard Aphids, Healthy Wheat).
   - Voice problem description with simulated speech-to-text.
   - Realistic multi-stage diagnostic scanning with symptom breakdown, chemical/organic guidance, Banda weather context correlation, and prominent legal advisory disclaimers.
   - One-click escalation to KVK Banda scientists.

2. **Government Schemes Discovery**:
   - Filter by State (UP, MP, Punjab), District, Crop, and Farmer Category (Small/Marginal, Medium, Tenant).
   - Direct integration links and document checklists for **PM-KISAN**, **PMFBY**, **UP SMAM Krishi Yantra Farm Mechanization**, **Kisan Credit Card (KCC)**, **Soil Health Card**, and **PKVY Organic**.

3. **Mandi Intelligence**:
   - Compares modal prices, minimums, maximums, and daily arrivals across APMC mandis (Banda, Atarra, Mahoba, Karwi, Kanpur).
   - Tracks daily price trends (`+₹35/qtl`, `+₹40/qtl`) alongside official Government Minimum Support Price (MSP).
   - Direct link to the national **e-NAM** portal.

4. **Weather & Hyperlocal Risk Alerts**:
   - Live-style telemetry for Banda District, Uttar Pradesh (Temperature, Humidity, Rain Probability, Wind Speed, UV Index).
   - Prominent **Bundelkhand Rain Risk Alert** advising farmers to postpone pesticide spraying during approaching western disturbances.
   - 5-Day agro-forecast with specific field advisories.

5. **Crop Insurance (PMFBY) Guidance**:
   - Clear breakdown of the critical **72-Hour Claim Window** following hailstorms, waterlogging, or localized calamities.
   - Interactive **Farmer Premium Calculator** calculating farmer share (1.5% Rabi, 2% Kharif, 5% Commercial) versus government subsidy.
   - Toll-free helplines (`14447` and `1800 180 1551`).

6. **Expert & KVK Connect**:
   - Directory of verified agronomists from **Krishi Vigyan Kendra (ICAR), Banda** under **Banda University of Agriculture & Technology (BUAT)**.
   - Digital case dispatch creating tracked reference IDs (e.g. `KVK-BND-2026-8841`).

7. **Interactive Guided Demo Mode ("Try Demo")**:
   - 8-step guided interactive walkthrough following farmer **Aditya** from **Tindwari, Banda, Uttar Pradesh** farming **Wheat**.
   - Transparently labeled with **"Demo Data"** badges.

8. **Bilingual Accessibility (English & सरल हिंदी)**:
   - Instant real-time UI switching between English and farmer-friendly Hindi across all views, forms, and results.

9. **Farmer Dashboard**:
   - Unified personal control center ("Namaste, Farmer Aditya 👋") summarizing active weather risks, crop health scans, enrolled scheme statuses, and upcoming deadlines.

10. **Zero-Friction Authentication**:
    - Clean mobile number + OTP verification with resend timer and one-click "Quick Login as Farmer Aditya (Demo)".

---

## 🚀 How to Run the Website

### Option 1: Direct in Any Browser (Zero Setup)
Simply double-click `index.html` or open it in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.  
No server or build installation is required!

### Option 2: Using the Included Node.js Server
Run the lightweight zero-dependency server:

```powershell
# Using the installed Antigravity Node runtime:
& "C:\Users\manee\AppData\Roaming\Antigravity\bin\agy-node.cmd" server.js

# Or with any standard Node.js installation:
node server.js
```

Then open your browser to:
```
http://localhost:3000
```

---

## 📡 API Endpoints (Architecture Ready)

The built-in `server.js` provides REST endpoints ready for future live API integrations:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | GET | Server health, team attribution, and platform metadata |
| `/api/weather` | GET | Banda weather telemetry and active agro-risk alerts |
| `/api/mandi` | GET | APMC mandi arrivals, modal prices, and e-NAM status |
| `/api/crop-analyze` | POST | Simulated computer vision crop diagnostic endpoint |

---

## 👥 Team & Hackathon Details

- **Event**: Smart India Hackathon 2026
- **Team**: Tech Titans
- **Institution**: Rajkiya Engineering College, Banda (REC Banda)
- **Problem Statement Category**: Agriculture, Food Technology & Rural Development
