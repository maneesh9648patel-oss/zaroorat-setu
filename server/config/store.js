/**
 * ZarooratSetu - In-Memory / File-backed Database (Firestore Mock)
 * Emulates Firestore collections: users, requests, items, handover_tokens, audit_logs, offline_queue
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from '../utils/security.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

const INITIAL_DATA = {
  users: [
    {
      uid: "usr_aarav",
      phone: "+919876543210",
      email: "aarav.banda@example.com",
      displayName: "Aarav Kumar",
      publicName: "Aarav K.",
      role: "needer",
      kycLevel: "level_1",
      kycStatus: "basic_verified",
      area: "Civil Lines",
      city: "Banda",
      coordinates: { lat: 25.4764, lng: 80.3344 },
      idDocumentPlaceholder: { status: "not_submitted", provider: "Authorized Partner (Coming Soon)" },
      createdAt: new Date().toISOString()
    },
    {
      uid: "usr_ngo_01",
      phone: "+919415112345",
      email: "seva.banda@example.org",
      displayName: "Seva Sahayata Trust",
      publicName: "Seva Sahayata Trust",
      role: "ngo",
      kycLevel: "level_3",
      kycStatus: "fully_verified",
      area: "Civil Lines",
      city: "Banda",
      coordinates: { lat: 25.4780, lng: 80.3390 },
      ngoDetails: { regNumber: "UP/2021/BND/0042", verifiedByAdmin: true },
      createdAt: new Date().toISOString()
    },
    {
      uid: "usr_donor_priya",
      phone: "+919839054321",
      email: "priya.v@example.com",
      displayName: "Priya Verma",
      publicName: "Priya V.",
      role: "donor",
      kycLevel: "level_2",
      kycStatus: "fully_verified",
      area: "District Hospital Banda",
      city: "Banda",
      coordinates: { lat: 25.4810, lng: 80.3410 },
      idDocumentPlaceholder: { status: "verified", provider: "Manual Verifier Verified" },
      createdAt: new Date().toISOString()
    },
    {
      uid: "usr_student_rec",
      phone: "+919838012345",
      email: "rec.robotics@recbanda.ac.in",
      displayName: "REC Banda Innovation Club",
      publicName: "REC Banda Maker Club",
      role: "lender",
      kycLevel: "level_2",
      kycStatus: "fully_verified",
      area: "REC Banda",
      city: "Banda",
      coordinates: { lat: 25.5348, lng: 80.3478 },
      createdAt: new Date().toISOString()
    },
    {
      uid: "usr_kitchen_banda",
      phone: "+919415055667",
      email: "kitchen.seva@banda.ngo",
      displayName: "Banda Community Rasoi (Kitchen)",
      publicName: "Banda Community Kitchen",
      role: "ngo",
      kycLevel: "level_3",
      kycStatus: "fully_verified",
      area: "Civil Lines",
      city: "Banda",
      coordinates: { lat: 25.4764, lng: 80.3344 },
      createdAt: new Date().toISOString()
    },
    {
      uid: "usr_verifier_01",
      phone: "+919450099887",
      email: "verifier01@zarooratsetu.org",
      displayName: "Manoj Tripathi",
      publicName: "Manoj T. (Reviewer)",
      role: "verifier",
      kycLevel: "level_2",
      kycStatus: "fully_verified",
      area: "REC Banda",
      city: "Banda",
      coordinates: { lat: 25.5348, lng: 80.3478 },
      createdAt: new Date().toISOString()
    },
    {
      uid: "usr_admin",
      phone: "+919999900000",
      email: "admin@zarooratsetu.org",
      displayName: "Admin ZarooratSetu",
      publicName: "Platform Admin",
      role: "admin",
      kycLevel: "level_3",
      kycStatus: "fully_verified",
      area: "REC Banda",
      city: "Banda",
      coordinates: { lat: 25.5348, lng: 80.3478 },
      createdAt: new Date().toISOString()
    }
  ],
  requests: [
    {
      id: "req_1041",
      userId: "usr_ramesh",
      userPublicName: "Ramesh K.",
      userArea: "District Hospital, Banda",
      category: "Medical",
      title: "Blood donor, B+ required urgently",
      description: "Urgent need for B+ blood donor for emergency surgery at District Hospital Banda.",
      urgency: "Urgent",
      aiAnalysis: {
        suggestedPriority: "Urgent",
        score: 9.8,
        severityRating: "Critical Life Support Need",
        urgencyReason: "Surgery scheduled; requires immediate replacement units.",
        resourceAvailability: "Low (B+ blood inventory scarce)",
        disclaimer: "AI only suggests. A human verifier makes the final decision."
      },
      verifierStatus: "verified",
      verifierNotes: "Hospital admission slip confirmed by volunteer.",
      duplicateFlag: { isDuplicate: false, confidenceScore: 0.05, matchedWithId: null },
      status: "matched",
      matchedProvider: {
        providerId: "usr_donor_priya",
        providerName: "Priya V.",
        providerType: "Verified Donor",
        distanceKm: 2.1
      },
      coordinates: { lat: 25.4810, lng: 80.3410 },
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString()
    },
    {
      id: "req_1042",
      userId: "usr_aarav",
      userPublicName: "Aarav K.",
      userArea: "Civil Lines, Banda",
      category: "Items",
      title: "Wheelchair for 2 weeks",
      description: "Wheelchair needed for two weeks after a leg fracture.",
      urgency: "High",
      aiAnalysis: {
        suggestedPriority: "High",
        score: 8.2,
        severityRating: "Severe Temporary Mobility Loss",
        urgencyReason: "Fracture rehabilitation requires safe mobility within 24h.",
        resourceAvailability: "Moderate in Civil Lines cluster.",
        disclaimer: "AI only suggests. A human verifier makes the final decision."
      },
      verifierStatus: "verified",
      verifierNotes: "Duplicate check passed. Priority confirmed as High.",
      duplicateFlag: { isDuplicate: false, confidenceScore: 0.1, matchedWithId: null },
      status: "matched",
      matchedProvider: {
        providerId: "usr_ngo_01",
        providerName: "Seva Sahayata Trust",
        providerType: "Verified NGO",
        distanceKm: 3.2
      },
      coordinates: { lat: 25.4764, lng: 80.3344 },
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
      id: "req_1043",
      userId: "usr_student",
      userPublicName: "Sunita P.",
      userArea: "REC Banda",
      category: "Education",
      title: "Scholarship form guidance & textbook",
      description: "Need guidance on UP Post-Matric Scholarship portal document upload and Semester 3 textbook.",
      urgency: "Normal",
      aiAnalysis: {
        suggestedPriority: "Normal",
        score: 4.5,
        severityRating: "Educational Support",
        urgencyReason: "Scholarship deadline is 10 days away.",
        resourceAvailability: "High (college student volunteers available)",
        disclaimer: "AI only suggests. A human verifier makes the final decision."
      },
      verifierStatus: "verified",
      verifierNotes: "Student ID verified at REC Banda desk.",
      duplicateFlag: { isDuplicate: false, confidenceScore: 0.02, matchedWithId: null },
      status: "verified",
      matchedProvider: null,
      coordinates: { lat: 25.5348, lng: 80.3478 },
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "req_1044",
      userId: "usr_deepak",
      userPublicName: "Deepak V.",
      userArea: "REC Banda Campus",
      category: "Education",
      title: "Casio fx-991EX Scientific Calculator for End-Sem Exam",
      description: "Exam starts tomorrow morning. Lost original calculator; need for 3 days of examination.",
      urgency: "High",
      aiAnalysis: {
        suggestedPriority: "High",
        score: 7.2,
        severityRating: "Academic Examination Urgency",
        urgencyReason: "End semester exams within 24 hours.",
        resourceAvailability: "High among senior students.",
        disclaimer: "AI only suggests. A human verifier makes the final decision."
      },
      verifierStatus: "verified",
      status: "submitted",
      matchedProvider: null,
      coordinates: { lat: 25.5348, lng: 80.3478 },
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    },
    {
      id: "req_1045",
      userId: "usr_shanti",
      userPublicName: "Shanti Devi",
      userArea: "Baberu",
      category: "Items",
      title: "Emergency Solar Lantern & Power Bank",
      description: "Severe transformer breakdown in village. Old mother requires continuous nebulizer illumination and emergency lighting.",
      urgency: "High",
      aiAnalysis: {
        suggestedPriority: "High",
        score: 7.8,
        severityRating: "Rural Power Outage Emergency Support",
        urgencyReason: "Transformer repair estimated in 48 hours.",
        resourceAvailability: "Available at Baberu volunteer hub.",
        disclaimer: "AI only suggests. A human verifier makes the final decision."
      },
      verifierStatus: "verified",
      status: "submitted",
      matchedProvider: null,
      coordinates: { lat: 25.5500, lng: 80.5500 },
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    }
  ],
  items: [
    // 1. STUDY MATERIAL (शिक्षा / अध्ययन सामग्री)
    {
      id: "itm_study_01",
      ownerId: "usr_student_rec",
      ownerPublicName: "REC Banda Maker Club",
      ownerArea: "REC Banda",
      name: "B.Tech Engineering Mathematics & Mechanics (Sem 1-4) Book Set",
      category: "Study Material",
      condition: "Very Good (No torn pages)",
      loanPeriodDays: 90,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "books",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_study_02",
      ownerId: "usr_student_rec",
      ownerPublicName: "Pooja S. (Student Volunteer)",
      ownerArea: "REC Banda",
      name: "Casio fx-991EX ClassWiz Scientific Calculator",
      category: "Study Material",
      condition: "Like New (Solar + Battery)",
      loanPeriodDays: 30,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "calculator",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_study_03",
      ownerId: "usr_verifier_01",
      ownerPublicName: "Manoj Tripathi (Verifier #01)",
      ownerArea: "Civil Lines, Banda",
      name: "UPPSC / UP Civil Services GS Comprehensive Notes & Solved Papers",
      category: "Study Material",
      condition: "Good with highlights",
      loanPeriodDays: 60,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "notes",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_study_04",
      ownerId: "usr_student_rec",
      ownerPublicName: "REC Banda Maker Club",
      ownerArea: "REC Banda",
      name: "Engineering Mini-Drafter with Steel Clamp & Drawing Board Kit",
      category: "Study Material",
      condition: "Excellent (Precision calibrated)",
      loanPeriodDays: 120,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "drafter",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_study_05",
      ownerId: "usr_ngo_01",
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Baberu",
      name: "NCERT Class 10 & 12 Science & Math Foundation Books Bundle",
      category: "Study Material",
      condition: "Complete 8-book set",
      loanPeriodDays: 180,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "ncert",
      createdAt: new Date().toISOString()
    },

    // 2. FAMILY UTENSILS (पारिवारिक / सामूहिक बर्तन)
    {
      id: "itm_utensil_01",
      ownerId: "usr_kitchen_banda",
      ownerPublicName: "Banda Community Kitchen",
      ownerArea: "Civil Lines, Banda",
      name: "Community Event Large Cooking Cauldron (बड़ा पतीला / देग - 50L Aluminum)",
      category: "Family Utensils",
      condition: "Heavy Gauge / Cleaned & Sanitized",
      loanPeriodDays: 7,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "patila",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_utensil_02",
      ownerId: "usr_kitchen_banda",
      ownerPublicName: "Banda Community Kitchen",
      ownerArea: "Civil Lines, Banda",
      name: "50-Person Stainless Steel Thali, Katori, Spoon & Water Glass Set",
      category: "Family Utensils",
      condition: "Mirror Polish Stainless Steel",
      loanPeriodDays: 5,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "thali",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_utensil_03",
      ownerId: "usr_kitchen_banda",
      ownerPublicName: "Banda Community Kitchen",
      ownerArea: "District Hospital Banda",
      name: "Commercial Heavy Cast Iron Kadhai & Puri Strainer (कड़ाही एवं झारा)",
      category: "Family Utensils",
      condition: "Seasoned Heavy Iron / Safe",
      loanPeriodDays: 5,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "kadhai",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_utensil_04",
      ownerId: "usr_ngo_01",
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Civil Lines, Banda",
      name: "25-Liter Stainless Steel Drinking Water Camper / Dispenser with Tap",
      category: "Family Utensils",
      condition: "Double-walled Insulated",
      loanPeriodDays: 14,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "camper",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_utensil_05",
      ownerId: "usr_ngo_01",
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Atarra",
      name: "Traditional Brass Ceremony & Pooja Utensil Set (पीतल हवन व पूजा सेट)",
      category: "Family Utensils",
      condition: "Pure Brass / Polished",
      loanPeriodDays: 7,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "brass",
      createdAt: new Date().toISOString()
    },

    // 3. ELECTRONICS & TOOLS (इलेक्ट्रॉनिक्स एवं उपकरण)
    {
      id: "itm_elec_01",
      ownerId: "usr_student_rec",
      ownerPublicName: "REC Banda Maker Club",
      ownerArea: "REC Banda",
      name: "Digital Multimeter & Complete Soldering Station Tool Kit",
      category: "Electronics",
      condition: "Professional Grade (with solder wire & pump)",
      loanPeriodDays: 14,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "soldering",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_elec_02",
      ownerId: "usr_ngo_01",
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Baberu",
      name: "Solar Emergency Lantern with Dual USB Phone Charging Bank",
      category: "Electronics",
      condition: "Lithium Ferro-Phosphate / 20h backup",
      loanPeriodDays: 14,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "solar",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_elec_03",
      ownerId: "usr_donor_priya",
      ownerPublicName: "Priya Verma (Donor)",
      ownerArea: "District Hospital Banda",
      name: "Ultrasonic Compressor Nebulizer Machine (Adult & Child Mask)",
      category: "Electronics",
      condition: "Medical Grade / Sterilized",
      loanPeriodDays: 14,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "nebulizer",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_elec_04",
      ownerId: "usr_donor_priya",
      ownerPublicName: "Priya Verma (Donor)",
      ownerArea: "District Hospital Banda",
      name: "Digital Automatic Upper Arm Blood Pressure Monitor (Omron)",
      category: "Electronics",
      condition: "Clinically Accurate & Battery Checked",
      loanPeriodDays: 21,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "bp_monitor",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_elec_05",
      ownerId: "usr_student_rec",
      ownerPublicName: "REC Banda Maker Club",
      ownerArea: "REC Banda",
      name: "Portable LED Projector & 80-inch Tripod Screen Set",
      category: "Electronics",
      condition: "Full HD 1080p / HDMI / USB",
      loanPeriodDays: 4,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "projector",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_elec_06",
      ownerId: "usr_ngo_01",
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Civil Lines, Banda",
      name: "Rechargeable 25W Megaphone with Siren & Auxiliary Mic",
      category: "Electronics",
      condition: "Excellent (Tested audio reach 500m)",
      loanPeriodDays: 5,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "megaphone",
      createdAt: new Date().toISOString()
    },

    // 4. MEDICAL & MOBILITY (चिकित्सा एवं गतिशीलता)
    {
      id: "itm_501",
      ownerId: "usr_ngo_01",
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Civil Lines, Banda",
      name: "Wheelchair, foldable lightweight with hand brakes",
      category: "Medical & Mobility",
      condition: "Excellent / Sanitized",
      loanPeriodDays: 14,
      status: "borrowed",
      currentBorrowerId: "usr_aarav",
      returnDeadline: "Saturday, 8 Nov",
      disputeFlag: false,
      tag: "wheelchair",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_502",
      ownerId: "usr_donor_priya",
      ownerPublicName: "Priya Verma",
      ownerArea: "District Hospital Banda",
      name: "Walking Crutches (Pair, Adult adjustable aluminum)",
      category: "Medical & Mobility",
      condition: "Like New with rubber grips",
      loanPeriodDays: 21,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "crutches",
      createdAt: new Date().toISOString()
    },
    {
      id: "itm_503",
      ownerId: "usr_ngo_01",
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Civil Lines, Banda",
      name: "Adjustable Orthopedic Backrest for Patient Bed Care",
      category: "Medical & Mobility",
      condition: "Multi-angle adjustable steel",
      loanPeriodDays: 30,
      status: "available",
      currentBorrowerId: null,
      returnDeadline: null,
      disputeFlag: false,
      tag: "backrest",
      createdAt: new Date().toISOString()
    }
  ],
  handover_tokens: [
    {
      tokenId: "tok_demo_active",
      tokenHash: "demo_hash_1042",
      requestId: "req_1042",
      itemId: "itm_501",
      lenderId: "usr_ngo_01",
      receiverId: "usr_aarav",
      status: "active",
      nonce: "demo_nonce_77",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  audit_logs: [
    {
      id: "aud_01",
      action: "REQUEST_VERIFIED",
      entityType: "request",
      entityId: "req_1042",
      performedBy: "usr_verifier_01",
      performerName: "Manoj Tripathi (Verifier #01)",
      performerRole: "verifier",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      details: "Duplicate check passed. Priority confirmed as High."
    }
  ],
  offline_queue: [
    {
      id: "off_01",
      source: "missed_call",
      callerPhoneMasked: "+91 98XXX X4210",
      rawText: "Need oxygen concentrator near Baberu",
      status: "pending-assist",
      assignedVolunteerId: null,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ],
  transactions: [
    {
      id: "txn_init_01",
      item_id: "itm_study_01",
      giver_id: "usr_student_rec",
      receiver_id: "usr_aarav",
      quantity: 1,
      type: "take",
      status: "completed",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      item_name: "B.Tech Engineering Mathematics & Mechanics (Sem 1-4) Book Set",
      item_category: "Study Material",
      giver_name: "REC Banda Maker Club",
      giver_phone: "+919838012345",
      giver_aadhaar_last4: "1234",
      receiver_name: "Aarav Kumar",
      receiver_phone: "+919876543210",
      receiver_aadhaar_last4: "9842"
    },
    {
      id: "txn_init_02",
      item_id: "itm_elec_02",
      giver_id: "usr_donor_priya",
      receiver_id: "usr_aarav",
      quantity: 1,
      type: "take",
      status: "completed",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      item_name: "Solar Emergency Lantern with Dual USB Phone Charging Bank",
      item_category: "Electronics",
      giver_name: "Priya Verma",
      giver_phone: "+919839054321",
      giver_aadhaar_last4: "8899",
      receiver_name: "Aarav Kumar",
      receiver_phone: "+919876543210",
      receiver_aadhaar_last4: "9842"
    },
    {
      id: "txn_init_03",
      item_id: "itm_utensil_01",
      giver_id: "usr_aarav",
      receiver_id: "usr_ngo_01",
      quantity: 2,
      type: "give",
      status: "completed",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      item_name: "Heavy Duty Stainless Steel Community Daawat Patila (50L)",
      item_category: "Family Utensils",
      giver_name: "Aarav Kumar",
      giver_phone: "+919876543210",
      giver_aadhaar_last4: "9842",
      receiver_name: "Seva Sahayata Trust",
      receiver_phone: "+919415112345",
      receiver_aadhaar_last4: "5566"
    }
  ]
};

class DataStore {
  constructor() {
    this.data = INITIAL_DATA;
    this.init();
  }

  init() {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        try {
          const content = fs.readFileSync(DB_FILE, 'utf-8');
          const parsed = JSON.parse(content);
          if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
            this.data = parsed;
          } else {
            this.data = INITIAL_DATA;
          }
        } catch (e) {
          this.data = INITIAL_DATA;
        }
      } else {
        this.data = INITIAL_DATA;
      }

      // Ensure demo accounts have a passwordHash so they can be logged into with password123
      const defaultHash = hashPassword('password123');
      for (const u of this.data.users) {
        if (!u.passwordHash) {
          u.passwordHash = defaultHash;
        }
      }

      // Ensure transactions collection is present
      if (!Array.isArray(this.data.transactions) || this.data.transactions.length === 0) {
        this.data.transactions = INITIAL_DATA.transactions;
      }

      // Ensure items have owner_id, quantity_total, and quantity_available
      if (Array.isArray(this.data.items)) {
        for (const item of this.data.items) {
          item.owner_id = item.owner_id || item.ownerId;
          item.ownerId = item.owner_id;
          item.quantity_total = Number(item.quantity_total || 1);
          item.quantity_available = Number(item.quantity_available ?? item.quantity_total ?? 1);
        }
      }

      this.persist();
    } catch (e) {
      console.warn("Using in-memory store (file sync fallback):", e.message);
    }
  }

  persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.warn("Could not persist to db.json:", e.message);
    }
  }

  // Users
  getUserByUid(uid) {
    if (!uid) return null;
    return this.data.users.find(u => u.uid === uid) || null;
  }

  getUserByPhone(phone) {
    if (!phone) return null;
    const clean = phone.toString().replace(/\D/g, '').slice(-10);
    if (!clean) return null;
    return this.data.users.find(u => {
      if (!u.phone) return false;
      const uClean = u.phone.toString().replace(/\D/g, '').slice(-10);
      return uClean === clean;
    }) || null;
  }

  getUserByEmail(email) {
    if (!email || typeof email !== 'string') return null;
    const cleanEmail = email.trim().toLowerCase();
    return this.data.users.find(u => u.email && u.email.trim().toLowerCase() === cleanEmail) || null;
  }

  createUser(userData) {
    if (userData.phone) {
      const existing = this.getUserByPhone(userData.phone);
      if (existing) return existing;
    }
    if (userData.email) {
      const existingEmail = this.getUserByEmail(userData.email);
      if (existingEmail) return existingEmail;
    }

    const user = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.users.push(user);
    this.persist();
    return user;
  }

  updateUser(uid, updates) {
    const idx = this.data.users.findIndex(u => u.uid === uid);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.users[idx];
  }

  // Privacy helper: Sanitizes sensitive details from user record
  // NEVER exposes passwordHash, salt, or private tokens
  // If isOwner is false, phone and email are stripped to protect privacy from public viewers
  sanitizeUser(user, isOwner = false) {
    if (!user) return null;
    const sanitized = {
      uid: user.uid,
      displayName: user.displayName,
      publicName: user.publicName || (user.displayName ? `${user.displayName.split(' ')[0]} ${user.displayName.split(' ')[1]?.[0] || ''}.` : 'Community Member'),
      role: user.role,
      kycLevel: user.kycLevel,
      kycStatus: user.kycStatus,
      area: user.area || "Civil Lines",
      city: user.city || "Banda",
      isAadhaarVerified: Boolean(user.aadhaarVerification && user.aadhaarVerification.verified),
      ngoDetails: user.ngoDetails ? { regNumber: user.ngoDetails.regNumber, verified: true } : null,
      createdAt: user.createdAt
    };

    if (isOwner) {
      sanitized.phone = user.phone || null;
      sanitized.email = user.email || null;
      sanitized.aadhaarVerification = user.aadhaarVerification || null;
    }

    return sanitized;
  }

  sanitizePrivateUser(user) {
    return this.sanitizeUser(user, true);
  }

  // Requests
  getRequests(filter = {}) {
    let list = [...this.data.requests];
    if (filter.status) list = list.filter(r => r.status === filter.status);
    if (filter.category && filter.category !== 'all') list = list.filter(r => r.category === filter.category);
    if (filter.verifierStatus) list = list.filter(r => r.verifierStatus === filter.verifierStatus);
    return list;
  }

  getRequestById(id) {
    return this.data.requests.find(r => r.id === id) || null;
  }

  createRequest(reqData) {
    const newReq = {
      ...reqData,
      id: reqData.id || `req_${Date.now()}`,
      status: reqData.status || "submitted",
      verifierStatus: reqData.verifierStatus || "pending",
      createdAt: new Date().toISOString()
    };
    this.data.requests.unshift(newReq);
    this.persist();
    return newReq;
  }

  updateRequest(id, updates) {
    const idx = this.data.requests.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.requests[idx] = {
      ...this.data.requests[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.requests[idx];
  }

  // Items Collection (id, name, category, quantity_total, quantity_available, owner_id)
  getItems() {
    return this.data.items.map(item => ({
      ...item,
      owner_id: item.owner_id || item.ownerId,
      ownerId: item.owner_id || item.ownerId,
      quantity_total: Number(item.quantity_total || 1),
      quantity_available: Number(item.quantity_available ?? item.quantity_total ?? 1)
    }));
  }

  getItemById(id) {
    const item = this.data.items.find(i => i.id === id);
    if (!item) return null;
    return {
      ...item,
      owner_id: item.owner_id || item.ownerId,
      ownerId: item.owner_id || item.ownerId,
      quantity_total: Number(item.quantity_total || 1),
      quantity_available: Number(item.quantity_available ?? item.quantity_total ?? 1)
    };
  }

  createItem(itemData) {
    const qty = Math.max(1, Number(itemData.quantity_total || itemData.quantity || 1));
    const ownerId = itemData.owner_id || itemData.ownerId;
    const giverUser = this.getUserByUid(ownerId);

    const newItem = {
      ...itemData,
      id: itemData.id || `itm_${Date.now()}`,
      name: (itemData.name || "").trim(),
      category: (itemData.category || "General").trim(),
      quantity_total: qty,
      quantity_available: qty,
      owner_id: ownerId,
      ownerId: ownerId,
      ownerPublicName: itemData.ownerPublicName || giverUser?.displayName || "Community Member",
      status: "available",
      createdAt: new Date().toISOString()
    };

    this.data.items.unshift(newItem);

    // Save initial give transaction in transactions collection
    this.createTransaction({
      item_id: newItem.id,
      giver_id: ownerId,
      receiver_id: null,
      quantity: qty,
      type: "give",
      status: "available",
      item_name: newItem.name,
      item_category: newItem.category,
      giver_name: giverUser?.displayName || newItem.ownerPublicName,
      giver_phone: giverUser?.phone || null,
      giver_aadhaar_last4: giverUser?.aadhaarVerification?.last4 || null,
      receiver_name: "Community Catalog (Available to Take)",
      receiver_phone: null,
      receiver_aadhaar_last4: null
    });

    this.persist();
    return newItem;
  }

  updateItem(id, updates) {
    const idx = this.data.items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.data.items[idx] = {
      ...this.data.items[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.items[idx];
  }

  // Transactions Collection (id, item_id, giver_id, receiver_id, quantity, type: give/take, status, created_at)
  createTransaction(txnData) {
    if (!Array.isArray(this.data.transactions)) {
      this.data.transactions = [];
    }

    const newTxn = {
      id: txnData.id || `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      item_id: txnData.item_id,
      giver_id: txnData.giver_id,
      receiver_id: txnData.receiver_id || null,
      quantity: Math.max(1, Number(txnData.quantity || 1)),
      type: txnData.type || "give", // "give" | "take"
      status: txnData.status || "completed",
      created_at: txnData.created_at || new Date().toISOString(),
      // Saved with both giver's and receiver's details
      item_name: txnData.item_name || "Community Resource",
      item_category: txnData.item_category || "General",
      giver_name: txnData.giver_name || "Community Lender",
      giver_phone: txnData.giver_phone || null,
      giver_aadhaar_last4: txnData.giver_aadhaar_last4 || null,
      receiver_name: txnData.receiver_name || null,
      receiver_phone: txnData.receiver_phone || null,
      receiver_aadhaar_last4: txnData.receiver_aadhaar_last4 || null
    };

    this.data.transactions.unshift(newTxn);
    this.persist();
    return newTxn;
  }

  takeItem({ itemId, quantity = 1, receiverUser }) {
    const qty = Math.max(1, Number(quantity) || 1);
    const item = this.data.items.find(i => i.id === itemId);
    if (!item) {
      throw new Error("Item not found in catalog");
    }

    const available = Number(item.quantity_available ?? item.quantity_total ?? 1);
    if (available < qty) {
      throw new Error(`Only ${available} unit(s) available for '${item.name}'`);
    }

    // Deduct available quantity
    item.quantity_available = available - qty;
    if (item.quantity_available === 0) {
      item.status = "borrowed";
    }

    const giverId = item.owner_id || item.ownerId;
    const giverUser = this.getUserByUid(giverId);

    // Save transaction with both giver and receiver details
    const txn = this.createTransaction({
      item_id: item.id,
      giver_id: giverId,
      receiver_id: receiverUser.uid,
      quantity: qty,
      type: "take",
      status: "completed",
      item_name: item.name,
      item_category: item.category,
      giver_name: giverUser?.displayName || item.ownerPublicName || "Community Lender",
      giver_phone: giverUser?.phone || null,
      giver_aadhaar_last4: giverUser?.aadhaarVerification?.last4 || null,
      receiver_name: receiverUser.displayName || receiverUser.publicName || "Community Member",
      receiver_phone: receiverUser.phone || null,
      receiver_aadhaar_last4: receiverUser.aadhaarVerification?.last4 || null
    });

    this.persist();
    return { item, transaction: txn };
  }

  getTransactions(filter = {}) {
    if (!Array.isArray(this.data.transactions)) {
      this.data.transactions = [];
    }
    let list = [...this.data.transactions];
    if (filter.giver_id) list = list.filter(t => t.giver_id === filter.giver_id);
    if (filter.receiver_id) list = list.filter(t => t.receiver_id === filter.receiver_id);
    if (filter.item_id) list = list.filter(t => t.item_id === filter.item_id);
    if (filter.type) list = list.filter(t => t.type === filter.type);
    return list;
  }

  getMyHistory(userId) {
    if (!Array.isArray(this.data.transactions)) {
      this.data.transactions = [];
    }
    const all = this.data.transactions;
    // Items I gave: where giver_id is userId
    const gave = all.filter(t => t.giver_id === userId);
    // Items I took: where receiver_id is userId
    const took = all.filter(t => t.receiver_id === userId);

    return {
      gave,
      took,
      totalGave: gave.reduce((acc, t) => acc + (Number(t.quantity) || 0), 0),
      totalTook: took.reduce((acc, t) => acc + (Number(t.quantity) || 0), 0)
    };
  }

  // Handover tokens
  getToken(tokenId) {
    return this.data.handover_tokens.find(t => t.tokenId === tokenId) || null;
  }

  createToken(tokenData) {
    const token = {
      ...tokenData,
      tokenId: tokenData.tokenId || `tok_${Math.random().toString(36).substring(2, 9)}`,
      status: "active",
      createdAt: new Date().toISOString()
    };
    this.data.handover_tokens.push(token);
    this.persist();
    return token;
  }

  updateToken(tokenId, updates) {
    const idx = this.data.handover_tokens.findIndex(t => t.tokenId === tokenId);
    if (idx === -1) return null;
    this.data.handover_tokens[idx] = {
      ...this.data.handover_tokens[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.handover_tokens[idx];
  }

  // Audit Logs
  logAudit(auditData) {
    const log = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      ...auditData,
      timestamp: new Date().toISOString()
    };
    this.data.audit_logs.unshift(log);
    this.persist();
    return log;
  }

  getAuditLogs() {
    return [...this.data.audit_logs];
  }

  // Offline Queue
  getOfflineQueue() {
    return [...this.data.offline_queue];
  }

  createOfflineTicket(ticketData) {
    const ticket = {
      id: `off_${Date.now()}`,
      ...ticketData,
      status: "pending-assist",
      createdAt: new Date().toISOString()
    };
    this.data.offline_queue.unshift(ticket);
    this.persist();
    return ticket;
  }

  updateOfflineTicket(id, updates) {
    const idx = this.data.offline_queue.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.offline_queue[idx] = {
      ...this.data.offline_queue[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.offline_queue[idx];
  }
}

export const db = new DataStore();
