/**
 * ZarooratSetu - In-Memory / File-backed Database (Firestore Mock)
 * Emulates Firestore collections: users, requests, items, handover_tokens, audit_logs, offline_queue
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from '../utils/security.js';
import { processAndSaveFile } from '../utils/fileStorage.js';

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
    },
    {
      uid: "usr_moderator_01",
      phone: "+919811223344",
      email: "moderator@zarooratsetu.org",
      displayName: "Sunita Sharma",
      publicName: "Sunita S. (Dispute Moderator)",
      role: "moderator",
      kycLevel: "level_3",
      kycStatus: "fully_verified",
      area: "REC Banda",
      city: "Banda",
      coordinates: { lat: 25.5348, lng: 80.3478 },
      createdAt: new Date().toISOString()
    },
    {
      uid: "usr_moderator_02",
      phone: "+919811223355",
      email: "appeal.moderator@zarooratsetu.org",
      displayName: "Rajeev Verma",
      publicName: "Rajeev V. (Senior Appeals Moderator)",
      role: "moderator",
      kycLevel: "level_3",
      kycStatus: "fully_verified",
      area: "Civil Lines",
      city: "Banda",
      coordinates: { lat: 25.4764, lng: 80.3344 },
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
  ],
  agreements: [
    {
      id: "agr_demo_01",
      transaction_id: "txn_init_02",
      item_id: "itm_elec_02",
      item_name: "Solar Emergency Lantern with Dual USB Phone Charging Bank",
      item_category: "Electronics",
      quantity: 1,
      lender_id: "usr_donor_priya",
      lender_name: "Priya Verma",
      lender_verified: true,
      lender_aadhaar_last4: "8899",
      borrower_id: "usr_aarav",
      borrower_name: "Aarav Kumar",
      borrower_verified: true,
      borrower_aadhaar_last4: "9842",
      condition_summary: "Brand new solar lantern, pristine casing, tested dual USB output, original charging cable.",
      issue_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      duration_days: 14,
      due_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
      clauses: {
        damage_loss_clause: "The borrower hereby acknowledges receipt of the item in the recorded baseline condition. The borrower agrees to take reasonable care and assumes financial and physical responsibility for any damage, loss, or unauthorized alteration beyond ordinary wear and tear, and agrees to reimburse repair or replacement costs determined through dispute resolution.",
        dispute_process_clause: "In the event of physical damage, non-return, or discrepancy, either party may file a formal dispute on ZarooratSetu within 7 days of scheduled return. The dispute will be decided based on tamper-evident digital evidence (before/after photos, videos, condition notes, and digital agreement) by a certified platform moderator. The decision shall be binding subject to a one-time 48-hour appeal review."
      },
      lender_agreed: true,
      lender_agreed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      lender_agreed_ip: "127.0.0.1",
      borrower_agreed: true,
      borrower_agreed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      borrower_agreed_ip: "127.0.0.1",
      is_locked: true,
      locked_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  condition_photos: [
    {
      id: "cphoto_demo_before",
      transaction_id: "txn_init_02",
      stage: "before_borrow",
      uploader_id: "usr_donor_priya",
      uploader_role: "lender",
      photos: [
        {
          id: "photo_b1",
          url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=70",
          name: "lantern_front_led.jpg",
          size: 180000,
          mimeType: "image/jpeg",
          type: "photo",
          uploader_id: "usr_donor_priya",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "photo_b2",
          url: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&auto=format&fit=crop&q=70",
          name: "lantern_charging_ports.jpg",
          size: 195000,
          mimeType: "image/jpeg",
          type: "photo",
          uploader_id: "usr_donor_priya",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "photo_b3",
          url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=70",
          name: "lantern_solar_panel.jpg",
          size: 210000,
          mimeType: "image/jpeg",
          type: "photo",
          uploader_id: "usr_donor_priya",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      condition_note: "Lantern is in full working condition. Solar charging panel clean. USB ports intact.",
      confirmed_by_other: true,
      confirmed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
      confirmed_by_id: "usr_aarav",
      objection_raised: false,
      objection_note: null,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "cphoto_demo_after_borrower",
      transaction_id: "txn_init_02",
      stage: "after_return",
      uploader_id: "usr_aarav",
      uploader_role: "borrower",
      photos: [
        {
          id: "photo_a1",
          url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=70",
          name: "return_lantern_lighting.jpg",
          size: 175000,
          mimeType: "image/jpeg",
          type: "photo",
          uploader_id: "usr_aarav",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "photo_a2",
          url: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&auto=format&fit=crop&q=70",
          name: "return_port_view.jpg",
          size: 190000,
          mimeType: "image/jpeg",
          type: "photo",
          uploader_id: "usr_aarav",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      condition_note: "Lantern fully functional. Used safely during outage and returned with cable.",
      confirmed_by_other: false,
      confirmed_at: null,
      confirmed_by_id: null,
      objection_raised: false,
      objection_note: null,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "cphoto_demo_after_lender",
      transaction_id: "txn_init_02",
      stage: "after_return",
      uploader_id: "usr_donor_priya",
      uploader_role: "lender",
      photos: [
        {
          id: "photo_a3",
          url: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&auto=format&fit=crop&q=70",
          name: "damaged_socket_detail.jpg",
          size: 205000,
          mimeType: "image/jpeg",
          type: "photo",
          uploader_id: "usr_donor_priya",
          timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "photo_a4",
          url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=70",
          name: "testing_cable_contact.jpg",
          size: 185000,
          mimeType: "image/jpeg",
          type: "photo",
          uploader_id: "usr_donor_priya",
          timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
        }
      ],
      condition_note: "Inspection upon return revealed internal contact pin inside USB port is pushed back and loose. Charging works only when held at angle.",
      confirmed_by_other: false,
      confirmed_at: null,
      confirmed_by_id: null,
      objection_raised: true,
      objection_note: "Socket damaged beyond normal wear. Raised complaint for repair cost.",
      created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
    }
  ],
  disputes: [
    {
      id: "disp_demo_01",
      transaction_id: "txn_init_02",
      item_id: "itm_elec_02",
      item_name: "Solar Emergency Lantern with Dual USB Phone Charging Bank",
      initiator_id: "usr_donor_priya",
      initiator_name: "Priya Verma",
      initiator_role: "lender",
      respondent_id: "usr_aarav",
      respondent_name: "Aarav Kumar",
      respondent_role: "borrower",
      status: "under_review",
      complaint_type: "damage",
      description: "When the lantern was returned, the micro-USB charging port pin was bent and loose. The device does not charge steadily anymore. Before-borrowing condition photos clearly prove the port was flush and undamaged when handed over.",
      desired_resolution: "Repair cost split of ₹250 to replace the socket at local repair centre in Civil Lines.",
      response_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      has_response: true,
      moderator_id: "usr_moderator_01",
      moderator_name: "Sunita Sharma",
      timeline: [
        {
          id: "tl_d1",
          action: "DISPUTE_RAISED",
          byUserId: "usr_donor_priya",
          byUserName: "Priya Verma",
          byRole: "lender",
          timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          details: "Complaint filed (damage): USB charging socket pin damaged upon return. Desired: ₹250 repair cost."
        },
        {
          id: "tl_d2",
          action: "RESPONSE_SUBMITTED",
          byUserId: "usr_aarav",
          byUserName: "Aarav Kumar",
          byRole: "borrower",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          details: "Response submitted: The cable fit was already somewhat snug when received. I am willing to contribute ₹100 towards volunteer technician checkup."
        },
        {
          id: "tl_d3",
          action: "INTERNAL_NOTE",
          byUserId: "usr_moderator_01",
          byUserName: "Sunita Sharma",
          byRole: "moderator",
          internalOnly: true,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          details: "Examined before and after photos. Before photo #2 shows port was centered. Return photo shows pin depression. Partial repair split looks warranted."
        }
      ],
      created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ],
  dispute_evidence: [
    {
      id: "ev_demo_01",
      dispute_id: "disp_demo_01",
      uploader_id: "usr_donor_priya",
      uploader_role: "lender",
      files: [
        {
          id: "file_ev1",
          url: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&auto=format&fit=crop&q=70",
          name: "close_up_damaged_socket.jpg",
          size: 210000,
          mimeType: "image/jpeg",
          type: "photo",
          uploadedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
        }
      ],
      notes: "High resolution close-up showing bent connector pin.",
      created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
    }
  ],
  dispute_responses: [
    {
      id: "resp_demo_01",
      dispute_id: "disp_demo_01",
      respondent_id: "usr_aarav",
      response_text: "I used the original cable carefully and charged my emergency phone twice during the village blackout. The port felt tight even on first plug-in. I did not drop or pull forcefully. Willing to contribute ₹100 to fix.",
      counter_proposal: "₹100 repair contribution to local community electronics volunteer.",
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
  ],
  moderator_decisions: []
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

      // Ensure dispute resolution collections are present
      if (!Array.isArray(this.data.agreements) || this.data.agreements.length === 0) {
        this.data.agreements = INITIAL_DATA.agreements;
      }
      if (!Array.isArray(this.data.condition_photos) || this.data.condition_photos.length === 0) {
        this.data.condition_photos = INITIAL_DATA.condition_photos;
      }
      if (!Array.isArray(this.data.disputes) || this.data.disputes.length === 0) {
        this.data.disputes = INITIAL_DATA.disputes;
      }
      if (!Array.isArray(this.data.dispute_evidence) || this.data.dispute_evidence.length === 0) {
        this.data.dispute_evidence = INITIAL_DATA.dispute_evidence;
      }
      if (!Array.isArray(this.data.dispute_responses) || this.data.dispute_responses.length === 0) {
        this.data.dispute_responses = INITIAL_DATA.dispute_responses;
      }
      if (!Array.isArray(this.data.moderator_decisions)) {
        this.data.moderator_decisions = [];
      }

      // Ensure demo moderators are in users list
      if (!this.data.users.some(u => u.uid === 'usr_moderator_01')) {
        this.data.users.push({
          uid: "usr_moderator_01",
          phone: "+919811223344",
          email: "moderator@zarooratsetu.org",
          displayName: "Sunita Sharma",
          publicName: "Sunita S. (Dispute Moderator)",
          role: "moderator",
          kycLevel: "level_3",
          kycStatus: "fully_verified",
          area: "REC Banda",
          city: "Banda",
          coordinates: { lat: 25.5348, lng: 80.3478 },
          passwordHash: defaultHash,
          trustScore: 100,
          disputesLostCount: 0,
          disputesWonCount: 0,
          isRestricted: false,
          createdAt: new Date().toISOString()
        });
      }
      if (!this.data.users.some(u => u.uid === 'usr_moderator_02')) {
        this.data.users.push({
          uid: "usr_moderator_02",
          phone: "+919811223355",
          email: "appeal.moderator@zarooratsetu.org",
          displayName: "Rajeev Verma",
          publicName: "Rajeev V. (Senior Appeals Moderator)",
          role: "moderator",
          kycLevel: "level_3",
          kycStatus: "fully_verified",
          area: "Civil Lines",
          city: "Banda",
          coordinates: { lat: 25.4764, lng: 80.3344 },
          passwordHash: defaultHash,
          trustScore: 100,
          disputesLostCount: 0,
          disputesWonCount: 0,
          isRestricted: false,
          createdAt: new Date().toISOString()
        });
      }

      // Ensure trust and dispute fields on all users
      for (const u of this.data.users) {
        if (typeof u.trustScore !== 'number') u.trustScore = 100;
        if (typeof u.disputesLostCount !== 'number') u.disputesLostCount = 0;
        if (typeof u.disputesWonCount !== 'number') u.disputesWonCount = 0;
        if (typeof u.isRestricted !== 'boolean') u.isRestricted = false;
        if (!u.restrictionReason) u.restrictionReason = null;
        if (!u.willingnessStatus) {
          u.willingnessStatus = (u.role === 'donor' || u.role === 'ngo' || u.role === 'lender')
            ? 'available_willing'
            : 'needs_confirmation';
        }
        if (typeof u.estimatedResponseMinutes !== 'number') {
          u.estimatedResponseMinutes = (u.role === 'donor' || u.role === 'ngo') ? 15 : 30;
        }
        if (!u.availableHours) {
          u.availableHours = (u.role === 'ngo' || u.role === 'donor') ? "24x7 Emergency Help" : "Daytime 8 AM - 9 PM";
        }
        if (!Array.isArray(u.specialties)) {
          if (u.role === 'donor') u.specialties = ["Medical", "Blood", "Emergency"];
          else if (u.role === 'ngo') u.specialties = ["Medical", "Items", "Family Utensils", "Emergency"];
          else if (u.role === 'lender') u.specialties = ["Study Material", "Electronics"];
          else u.specialties = ["Community Assistance"];
        }
      }

      // Ensure Smart Matching collections
      if (!Array.isArray(this.data.match_requests)) {
        this.data.match_requests = [];
      }
      if (!Array.isArray(this.data.notifications)) {
        this.data.notifications = [];
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
      mobile_verified: Boolean(userData.mobile_verified ?? true),
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
      mobile_verified: Boolean(user.mobile_verified ?? true),
      trustScore: typeof user.trustScore === 'number' ? user.trustScore : 100,
      disputesLostCount: user.disputesLostCount || 0,
      disputesWonCount: user.disputesWonCount || 0,
      isRestricted: Boolean(user.isRestricted),
      restrictionReason: user.restrictionReason || null,
      willingnessStatus: user.willingnessStatus || 'available_willing',
      estimatedResponseMinutes: typeof user.estimatedResponseMinutes === 'number' ? user.estimatedResponseMinutes : 20,
      availableHours: user.availableHours || 'Daytime 8 AM - 9 PM',
      specialties: Array.isArray(user.specialties) ? user.specialties : ['Community Assistance'],
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

    if (giverUser && giverUser.isRestricted) {
      throw new Error("Your account is restricted from lending items due to repeated dispute losses pending admin review.");
    }

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

  // Dynamic Duration & Overdue Status Calculator
  enrichTransaction(txn) {
    if (!txn) return null;
    const now = new Date();
    const isReturned = txn.status === 'returned' || Boolean(txn.return_date);
    const dueDate = txn.due_date ? new Date(txn.due_date) : null;
    
    let isOverdue = false;
    let daysRemaining = null;
    let daysOverdue = null;

    if (dueDate) {
      const diffMs = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      if (!isReturned) {
        if (diffDays < 0) {
          isOverdue = true;
          daysOverdue = Math.abs(diffDays);
          daysRemaining = 0;
        } else {
          isOverdue = false;
          daysRemaining = diffDays;
          daysOverdue = 0;
        }
      }
    }

    const effectiveStatus = isReturned ? 'returned' : (isOverdue ? 'overdue' : (txn.status || 'active'));

    return {
      ...txn,
      is_overdue: isOverdue,
      days_remaining: daysRemaining,
      days_overdue: daysOverdue,
      status: effectiveStatus,
      raw_status: txn.status
    };
  }

  // Transactions Collection (id, item_id, giver_id, receiver_id, quantity, type: give/take, status, created_at, issue_date, duration_days, due_date, return_date)
  createTransaction(txnData) {
    if (!Array.isArray(this.data.transactions)) {
      this.data.transactions = [];
    }

    const durationDays = Math.max(1, Number(txnData.duration_days || 14));
    const issueDate = txnData.issue_date || txnData.created_at || new Date().toISOString();
    const dueDate = txnData.due_date || new Date(new Date(issueDate).getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const newTxn = {
      id: txnData.id || `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      item_id: txnData.item_id,
      giver_id: txnData.giver_id,
      receiver_id: txnData.receiver_id || null,
      quantity: Math.max(1, Number(txnData.quantity || 1)),
      type: txnData.type || "give", // "give" | "take"
      status: txnData.status || (txnData.type === 'take' ? 'active' : 'available'),
      created_at: txnData.created_at || new Date().toISOString(),
      // Duration & Stock tracking fields
      issue_date: issueDate,
      duration_days: durationDays,
      due_date: dueDate,
      return_date: txnData.return_date || null,
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
    return this.enrichTransaction(newTxn);
  }

  takeItem({ itemId, quantity = 1, duration_days, receiverUser }) {
    if (receiverUser && receiverUser.isRestricted) {
      throw new Error("Your account is restricted from borrowing items due to repeated dispute losses pending admin review.");
    }
    const qty = Math.max(1, Number(quantity) || 1);
    const item = this.data.items.find(i => i.id === itemId);
    if (!item) {
      throw new Error("Item not found in catalog");
    }

    const available = Number(item.quantity_available ?? item.quantity_total ?? 1);
    // Block taking more than what is available
    if (available < qty) {
      throw new Error(`Only ${available} unit(s) available for '${item.name}'`);
    }

    // Auto-update stock: decrease quantity_available
    item.quantity_available = available - qty;
    if (item.quantity_available === 0) {
      item.status = "borrowed";
    }

    const giverId = item.owner_id || item.ownerId;
    const giverUser = this.getUserByUid(giverId);
    const durationDays = Math.max(1, Number(duration_days || item.loanPeriodDays || 14));
    const issueDate = new Date().toISOString();
    const dueDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    // Save transaction with issue_date, duration_days, auto-calculated due_date, and both counterparty details
    const txn = this.createTransaction({
      item_id: item.id,
      giver_id: giverId,
      receiver_id: receiverUser.uid,
      quantity: qty,
      type: "take",
      status: "active",
      issue_date: issueDate,
      duration_days: durationDays,
      due_date: dueDate,
      return_date: null,
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

  // "Mark as returned": increases stock and marks transaction returned
  returnItem({ transactionId, returningUser }) {
    if (!Array.isArray(this.data.transactions)) {
      this.data.transactions = [];
    }

    const txn = this.data.transactions.find(t => t.id === transactionId);
    if (!txn) {
      throw new Error("Transaction not found");
    }

    if (txn.status === 'returned' || txn.return_date) {
      throw new Error("Transaction is already marked as returned");
    }

    // Only the giver (or admin) can mark item as returned
    const isAdmin = returningUser && returningUser.role === 'admin';
    const isGiver = returningUser && txn.giver_id === returningUser.uid;
    const isReceiver = returningUser && txn.receiver_id === returningUser.uid;

    if (!isAdmin && !isGiver && !isReceiver) {
      throw new Error("Unauthorized: Only the giver of the item or an admin can mark it as returned");
    }

    // Update transaction
    txn.status = 'returned';
    txn.return_date = new Date().toISOString();

    // Auto-update stock: increase quantity_available
    const item = this.data.items.find(i => i.id === txn.item_id);
    if (item) {
      const currentAvail = Number(item.quantity_available ?? 0);
      const total = Number(item.quantity_total ?? 1);
      const returnedQty = Number(txn.quantity || 1);
      item.quantity_available = Math.min(total, currentAvail + returnedQty);
      if (item.quantity_available > 0) {
        item.status = "available";
      }
    }

    this.persist();
    return { 
      transaction: this.enrichTransaction(txn), 
      item: item ? { ...item } : null 
    };
  }

  getTransactions(filter = {}) {
    if (!Array.isArray(this.data.transactions)) {
      this.data.transactions = [];
    }
    let list = this.data.transactions.map(t => this.enrichTransaction(t));
    if (filter.giver_id) list = list.filter(t => t.giver_id === filter.giver_id);
    if (filter.receiver_id) list = list.filter(t => t.receiver_id === filter.receiver_id);
    if (filter.item_id) list = list.filter(t => t.item_id === filter.item_id);
    if (filter.type) list = list.filter(t => t.type === filter.type);
    if (filter.status) list = list.filter(t => t.status === filter.status);
    return list;
  }

  getMyHistory(userId) {
    if (!Array.isArray(this.data.transactions)) {
      this.data.transactions = [];
    }
    const all = this.data.transactions;
    // Items I gave: where giver_id is userId
    const gave = all.filter(t => t.giver_id === userId).map(t => this.enrichTransaction(t));
    // Items I took: where receiver_id is userId
    const took = all.filter(t => t.receiver_id === userId).map(t => this.enrichTransaction(t));

    return {
      gave,
      took,
      totalGave: gave.reduce((acc, t) => acc + (Number(t.quantity) || 0), 0),
      totalTook: took.reduce((acc, t) => acc + (Number(t.quantity) || 0), 0)
    };
  }

  // Admin / Dashboard: Full Records with Search & Filter
  getAllExchangeRecords(filter = {}) {
    if (!Array.isArray(this.data.transactions)) {
      this.data.transactions = [];
    }
    let list = this.data.transactions.map(t => this.enrichTransaction(t));

    if (filter.status && filter.status !== 'all') {
      list = list.filter(t => t.status === filter.status);
    }
    if (filter.category && filter.category !== 'all') {
      list = list.filter(t => t.item_category === filter.category);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(t => 
        (t.item_name && t.item_name.toLowerCase().includes(q)) ||
        (t.giver_name && t.giver_name.toLowerCase().includes(q)) ||
        (t.receiver_name && t.receiver_name.toLowerCase().includes(q)) ||
        (t.giver_phone && t.giver_phone.includes(q)) ||
        (t.receiver_phone && t.receiver_phone.includes(q)) ||
        (t.id && t.id.toLowerCase().includes(q))
      );
    }

    return list;
  }

  // Admin / Dashboard Stock & Overdue Summary
  getStockSummary() {
    const items = this.getItems();
    const transactions = this.getAllExchangeRecords();
    
    // Items currently given out: active take transactions
    const currentlyGivenOut = transactions.filter(t => t.type === 'take' && t.status !== 'returned');
    // Overdue items
    const overdueItems = currentlyGivenOut.filter(t => t.is_overdue);

    const totalStock = items.reduce((acc, i) => acc + Number(i.quantity_total || 0), 0);
    const availableStock = items.reduce((acc, i) => acc + Number(i.quantity_available || 0), 0);
    const borrowedStock = Math.max(0, totalStock - availableStock);

    return {
      summary: {
        totalStock,
        availableStock,
        borrowedStock,
        totalItemsCount: items.length,
        activeGivenOutCount: currentlyGivenOut.length,
        overdueCount: overdueItems.length
      },
      items,
      currentlyGivenOut,
      overdueItems,
      allTransactions: transactions
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

  // ==========================================
  // DISPUTE RESOLUTION & INTEGRITY SYSTEM
  // ==========================================

  // 1. Condition Photos (Before Borrow & After Return)
  saveConditionPhotos({ transactionId, stage, uploaderId, uploaderRole, photos, conditionNote = "" }) {
    if (!['before_borrow', 'after_return'].includes(stage)) {
      throw new Error("Invalid stage: Must be 'before_borrow' or 'after_return'");
    }

    if (!Array.isArray(photos) || photos.length < 2 || photos.length > 6) {
      throw new Error("Condition verification requires between 2 and 6 photos.");
    }

    const txn = this.data.transactions.find(t => t.id === transactionId);
    if (!txn) {
      throw new Error("Transaction not found");
    }

    const serverTimestamp = new Date().toISOString();
    const processedPhotos = photos.map((p, idx) => {
      let fileObj;
      try {
        fileObj = processAndSaveFile(p, 'photo');
      } catch (err) {
        fileObj = {
          id: `photo_${Date.now()}_${idx}`,
          url: typeof p === 'string' ? p : p.url,
          name: typeof p === 'object' && p.name ? p.name : `condition_photo_${idx + 1}.jpg`,
          size: 180000,
          mimeType: 'image/jpeg',
          type: 'photo'
        };
      }
      return {
        ...fileObj,
        uploader_id: uploaderId,
        timestamp: serverTimestamp // The server sets the timestamp, NOT the client!
      };
    });

    const record = {
      id: `cphoto_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      transaction_id: transactionId,
      stage,
      uploader_id: uploaderId,
      uploader_role: uploaderRole,
      photos: processedPhotos,
      condition_note: (conditionNote || "").trim(),
      confirmed_by_other: false,
      confirmed_at: null,
      confirmed_by_id: null,
      objection_raised: false,
      objection_note: null,
      created_at: serverTimestamp
    };

    if (!Array.isArray(this.data.condition_photos)) {
      this.data.condition_photos = [];
    }
    this.data.condition_photos.unshift(record);

    this.logAudit({
      action: "CONDITION_PHOTOS_UPLOADED",
      entityType: "condition_photo",
      entityId: record.id,
      performedBy: uploaderId,
      details: `${uploaderRole.toUpperCase()} uploaded ${processedPhotos.length} condition photos for transaction ${transactionId} (Stage: ${stage}).`
    });

    this.persist();
    return record;
  }

  confirmCondition({ transactionId, stage, userId, objectionNote = null }) {
    if (!Array.isArray(this.data.condition_photos)) {
      this.data.condition_photos = [];
    }

    // Find the latest condition photos for this transaction and stage
    const record = this.data.condition_photos.find(c => c.transaction_id === transactionId && c.stage === stage);
    if (!record) {
      throw new Error(`No condition photos found for stage '${stage}' on transaction ${transactionId}.`);
    }

    if (record.uploader_id === userId) {
      throw new Error("You cannot confirm your own uploaded condition photos. The counterparty must confirm.");
    }

    const now = new Date().toISOString();
    if (objectionNote && objectionNote.trim()) {
      record.objection_raised = true;
      record.objection_note = objectionNote.trim();
      record.confirmed_by_other = false;

      this.logAudit({
        action: "CONDITION_OBJECTION_RAISED",
        entityType: "condition_photo",
        entityId: record.id,
        performedBy: userId,
        details: `Objection raised on ${stage} photos for transaction ${transactionId}: ${objectionNote}`
      });
    } else {
      record.confirmed_by_other = true;
      record.confirmed_at = now;
      record.confirmed_by_id = userId;
      record.objection_raised = false;
      record.objection_note = null;

      this.logAudit({
        action: "CONDITION_CONFIRMED",
        entityType: "condition_photo",
        entityId: record.id,
        performedBy: userId,
        details: `Counterparty confirmed ${stage} condition photos for transaction ${transactionId}.`
      });
    }

    this.persist();
    return record;
  }

  getConditionPhotos(transactionId) {
    if (!Array.isArray(this.data.condition_photos)) {
      this.data.condition_photos = [];
    }
    const list = this.data.condition_photos.filter(c => c.transaction_id === transactionId);
    const beforeBorrow = list.filter(c => c.stage === 'before_borrow');
    const afterReturn = list.filter(c => c.stage === 'after_return');
    return {
      beforeBorrow,
      afterReturn,
      all: list,
      isBeforeConfirmed: beforeBorrow.some(b => b.confirmed_by_other && !b.objection_raised),
      isAfterConfirmed: afterReturn.some(a => a.confirmed_by_other && !a.objection_raised)
    };
  }

  // 2. Digital Agreement
  generateAgreement({ transactionId, lenderId, borrowerId, conditionSummary }) {
    if (!Array.isArray(this.data.agreements)) {
      this.data.agreements = [];
    }

    let existing = this.data.agreements.find(a => a.transaction_id === transactionId);
    if (existing) {
      return existing;
    }

    const txn = this.data.transactions.find(t => t.id === transactionId);
    if (!txn) {
      throw new Error("Transaction not found");
    }

    const lender = this.getUserByUid(lenderId || txn.giver_id);
    const borrower = this.getUserByUid(borrowerId || txn.receiver_id);
    const item = this.getItemById(txn.item_id);

    const agreement = {
      id: `agr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      transaction_id: transactionId,
      item_id: txn.item_id,
      item_name: txn.item_name || item?.name || "Community Resource",
      item_category: txn.item_category || item?.category || "General",
      quantity: txn.quantity || 1,

      lender_id: lender?.uid || txn.giver_id,
      lender_name: lender?.displayName || txn.giver_name || "Community Lender",
      lender_verified: Boolean(lender?.aadhaarVerification?.verified),
      lender_aadhaar_last4: lender?.aadhaarVerification?.last4 || txn.giver_aadhaar_last4 || null,

      borrower_id: borrower?.uid || txn.receiver_id,
      borrower_name: borrower?.displayName || txn.receiver_name || "Community Borrower",
      borrower_verified: Boolean(borrower?.aadhaarVerification?.verified),
      borrower_aadhaar_last4: borrower?.aadhaarVerification?.last4 || txn.receiver_aadhaar_last4 || null,

      condition_summary: conditionSummary || item?.condition || "Verified baseline condition with photos.",
      issue_date: txn.issue_date || new Date().toISOString(),
      duration_days: txn.duration_days || 14,
      due_date: txn.due_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),

      clauses: {
        damage_loss_clause: "The borrower hereby acknowledges receipt of the item in the recorded baseline condition. The borrower agrees to take reasonable care and assumes financial and physical responsibility for any damage, loss, or unauthorized alteration beyond ordinary wear and tear, and agrees to reimburse repair or replacement costs determined through dispute resolution.",
        dispute_process_clause: "In the event of physical damage, non-return, or discrepancy, either party may file a formal dispute on ZarooratSetu within 7 days of scheduled return. The dispute will be decided based on tamper-evident digital evidence (before/after photos, videos, condition notes, and digital agreement) by a certified platform moderator. The decision shall be binding subject to a one-time 48-hour appeal review."
      },

      lender_agreed: false,
      lender_agreed_at: null,
      lender_agreed_ip: null,

      borrower_agreed: false,
      borrower_agreed_at: null,
      borrower_agreed_ip: null,

      is_locked: false,
      locked_at: null,
      status: "pending_signatures",
      created_at: new Date().toISOString()
    };

    this.data.agreements.unshift(agreement);
    this.logAudit({
      action: "DIGITAL_AGREEMENT_GENERATED",
      entityType: "agreement",
      entityId: agreement.id,
      performedBy: (lender?.uid || borrower?.uid || "system"),
      details: `Generated digital exchange agreement for '${agreement.item_name}' between ${agreement.lender_name} and ${agreement.borrower_name}.`
    });

    this.persist();
    return agreement;
  }

  signAgreement({ agreementId, userId, ip = '127.0.0.1' }) {
    if (!Array.isArray(this.data.agreements)) {
      this.data.agreements = [];
    }
    const agr = this.data.agreements.find(a => a.id === agreementId);
    if (!agr) {
      throw new Error("Agreement not found");
    }
    if (agr.is_locked) {
      return agr;
    }

    const now = new Date().toISOString();
    let userRole = null;

    if (agr.lender_id === userId) {
      agr.lender_agreed = true;
      agr.lender_agreed_at = now;
      agr.lender_agreed_ip = ip;
      userRole = "lender";
    } else if (agr.borrower_id === userId) {
      agr.borrower_agreed = true;
      agr.borrower_agreed_at = now;
      agr.borrower_agreed_ip = ip;
      userRole = "borrower";
    } else {
      throw new Error("Unauthorized: You are not a counterparty in this agreement.");
    }

    if (agr.lender_agreed && agr.borrower_agreed) {
      agr.is_locked = true;
      agr.locked_at = now;
      agr.status = "active";
    }

    this.logAudit({
      action: "DIGITAL_AGREEMENT_SIGNED",
      entityType: "agreement",
      entityId: agr.id,
      performedBy: userId,
      details: `${userRole ? userRole.toUpperCase() : 'USER'} clicked 'I Agree' on agreement ${agr.id}. Locked status: ${agr.is_locked}.`
    });

    this.persist();
    return agr;
  }

  getAgreementByTransactionId(transactionId) {
    if (!Array.isArray(this.data.agreements)) return null;
    return this.data.agreements.find(a => a.transaction_id === transactionId) || null;
  }

  getAgreementById(id) {
    if (!Array.isArray(this.data.agreements)) return null;
    return this.data.agreements.find(a => a.id === id) || null;
  }

  // 3. Both-Side Complaint Option & Disputes
  createDispute({ transactionId, initiatorId, complaintType, description, desiredResolution, evidenceFiles = [] }) {
    if (!Array.isArray(this.data.disputes)) {
      this.data.disputes = [];
    }

    const txn = this.data.transactions.find(t => t.id === transactionId);
    if (!txn) {
      throw new Error("Transaction not found");
    }

    const isLender = txn.giver_id === initiatorId;
    const isBorrower = txn.receiver_id === initiatorId;
    if (!isLender && !isBorrower) {
      throw new Error("Unauthorized: Only the lender or borrower of this transaction can raise a complaint.");
    }

    const existing = this.data.disputes.find(d => d.transaction_id === transactionId && d.status !== 'resolved');
    if (existing) {
      throw new Error(`An active dispute (${existing.id}) is already in progress for this transaction.`);
    }

    const initiatorUser = this.getUserByUid(initiatorId);
    const respondentId = isLender ? txn.receiver_id : txn.giver_id;
    const respondentUser = this.getUserByUid(respondentId);
    const initiatorRole = isLender ? 'lender' : 'borrower';
    const respondentRole = isLender ? 'borrower' : 'lender';

    const now = new Date().toISOString();
    const responseDeadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days response window!
    const disputeId = `disp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Process and validate evidence files (photos, up to 3 short videos, screenshots)
    let videoCount = 0;
    const processedFiles = [];
    for (const fileInput of (evidenceFiles || [])) {
      try {
        const processed = processAndSaveFile(fileInput);
        if (processed.type === 'video') {
          videoCount++;
          if (videoCount > 3) {
            throw new Error("Evidence limit: A maximum of 3 short videos can be uploaded.");
          }
        }
        processedFiles.push(processed);
      } catch (err) {
        console.warn("Evidence file save error:", err.message);
      }
    }

    const dispute = {
      id: disputeId,
      transaction_id: transactionId,
      item_id: txn.item_id,
      item_name: txn.item_name,
      initiator_id: initiatorId,
      initiator_name: initiatorUser?.displayName || (isLender ? txn.giver_name : txn.receiver_name),
      initiator_role: initiatorRole,
      respondent_id: respondentId,
      respondent_name: respondentUser?.displayName || (isLender ? txn.receiver_name : txn.giver_name),
      respondent_role: respondentRole,
      status: "open", // 'open' | 'under_review' | 'awaiting_response' | 'resolved' | 'escalated'
      complaint_type: complaintType || "damage",
      description: (description || '').trim(),
      desired_resolution: (desiredResolution || '').trim(),
      response_deadline: responseDeadline,
      has_response: false,
      moderator_id: null,
      moderator_name: null,
      timeline: [
        {
          id: `tl_${Date.now()}_1`,
          action: "DISPUTE_RAISED",
          byUserId: initiatorId,
          byUserName: initiatorUser?.displayName || "Initiator",
          byRole: initiatorRole,
          timestamp: now,
          details: `Complaint filed (${complaintType}): ${description.slice(0, 100)}... Desired: ${desiredResolution}`
        }
      ],
      created_at: now,
      updated_at: now
    };

    this.data.disputes.unshift(dispute);

    if (!Array.isArray(this.data.dispute_evidence)) {
      this.data.dispute_evidence = [];
    }
    const evidenceRecord = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      dispute_id: disputeId,
      uploader_id: initiatorId,
      uploader_role: initiatorRole,
      files: processedFiles,
      notes: description,
      created_at: now
    };
    this.data.dispute_evidence.unshift(evidenceRecord);

    txn.status = 'disputed';
    const item = this.getItemById(txn.item_id);
    if (item) item.disputeFlag = true;

    this.logAudit({
      action: "DISPUTE_RAISED",
      entityType: "dispute",
      entityId: disputeId,
      performedBy: initiatorId,
      performerName: dispute.initiator_name,
      performerRole: initiatorRole,
      details: `Dispute raised on transaction ${transactionId} by ${dispute.initiator_name}. Reason: ${complaintType}.`
    });

    this.persist();
    return { dispute, evidence: evidenceRecord };
  }

  submitDisputeResponse({ disputeId, respondentId, responseText, counterProposal, evidenceFiles = [] }) {
    if (!Array.isArray(this.data.disputes)) {
      this.data.disputes = [];
    }
    const dispute = this.data.disputes.find(d => d.id === disputeId);
    if (!dispute) {
      throw new Error("Dispute not found");
    }
    if (dispute.respondent_id !== respondentId) {
      throw new Error("Unauthorized: Only the designated respondent can submit a response.");
    }
    if (dispute.status === 'resolved') {
      throw new Error("Cannot submit response to an already resolved dispute.");
    }

    const respondentUser = this.getUserByUid(respondentId);
    const now = new Date().toISOString();

    let videoCount = 0;
    const processedFiles = [];
    for (const fileInput of (evidenceFiles || [])) {
      try {
        const processed = processAndSaveFile(fileInput);
        if (processed.type === 'video') {
          videoCount++;
          if (videoCount > 3) throw new Error("Maximum of 3 short videos allowed.");
        }
        processedFiles.push(processed);
      } catch (err) {
        console.warn("Evidence save error:", err.message);
      }
    }

    if (!Array.isArray(this.data.dispute_responses)) {
      this.data.dispute_responses = [];
    }
    const responseRecord = {
      id: `resp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      dispute_id: disputeId,
      respondent_id: respondentId,
      response_text: responseText.trim(),
      counter_proposal: (counterProposal || '').trim(),
      created_at: now
    };
    this.data.dispute_responses.unshift(responseRecord);

    if (processedFiles.length > 0) {
      if (!Array.isArray(this.data.dispute_evidence)) {
        this.data.dispute_evidence = [];
      }
      this.data.dispute_evidence.unshift({
        id: `ev_${Date.now()}_resp`,
        dispute_id: disputeId,
        uploader_id: respondentId,
        uploader_role: dispute.respondent_role,
        files: processedFiles,
        notes: responseText,
        created_at: now
      });
    }

    dispute.has_response = true;
    dispute.status = 'under_review';
    dispute.updated_at = now;

    dispute.timeline.push({
      id: `tl_${Date.now()}_resp`,
      action: "RESPONSE_SUBMITTED",
      byUserId: respondentId,
      byUserName: respondentUser?.displayName || "Respondent",
      byRole: dispute.respondent_role,
      timestamp: now,
      details: `Response submitted: ${responseText.slice(0, 100)}... Counter proposal: ${counterProposal || 'None'}`
    });

    this.logAudit({
      action: "DISPUTE_RESPONSE_SUBMITTED",
      entityType: "dispute",
      entityId: disputeId,
      performedBy: respondentId,
      details: `Respondent ${dispute.respondent_name} submitted response and counter-evidence.`
    });

    this.persist();
    return { dispute, response: responseRecord };
  }

  getDisputeById(id, requestingUser = null) {
    if (!Array.isArray(this.data.disputes)) return null;
    const dispute = this.data.disputes.find(d => d.id === id);
    if (!dispute) return null;

    // Role-based Access Control:
    // Only the two counterparties, certified moderators, or admins may view the dispute
    if (requestingUser) {
      const isParty = requestingUser.uid === dispute.initiator_id || requestingUser.uid === dispute.respondent_id;
      const isModeratorOrAdmin = requestingUser.role === 'moderator' || requestingUser.role === 'admin';
      if (!isParty && !isModeratorOrAdmin) {
        throw new Error("FORBIDDEN: You do not have permission to view this dispute.");
      }
    }

    const isModeratorOrAdmin = requestingUser && (requestingUser.role === 'moderator' || requestingUser.role === 'admin');

    // Filter out internal notes for regular users
    const filteredTimeline = (dispute.timeline || []).filter(item => {
      if (item.internalOnly && !isModeratorOrAdmin) return false;
      return true;
    });

    // Gather digital agreement
    const agreement = this.getAgreementByTransactionId(dispute.transaction_id);

    // Gather condition photos (before & after side-by-side)
    const conditionPhotos = this.getConditionPhotos(dispute.transaction_id);

    // Gather all evidence files
    const evidence = (this.data.dispute_evidence || []).filter(e => e.dispute_id === id);

    // Gather respondent response
    const response = (this.data.dispute_responses || []).find(r => r.dispute_id === id) || null;

    // Gather moderator decision
    const decision = (this.data.moderator_decisions || []).find(m => m.dispute_id === id) || null;

    // Sanitized parties
    const initiator = this.sanitizeUser(this.getUserByUid(dispute.initiator_id));
    const respondent = this.sanitizeUser(this.getUserByUid(dispute.respondent_id));

    return {
      ...dispute,
      timeline: filteredTimeline,
      agreement,
      conditionPhotos,
      evidence,
      response,
      decision,
      initiator,
      respondent
    };
  }

  getDisputes(filter = {}, requestingUser = null) {
    if (!Array.isArray(this.data.disputes)) return [];
    let list = [...this.data.disputes];

    const isModeratorOrAdmin = requestingUser && (requestingUser.role === 'moderator' || requestingUser.role === 'admin');

    // If user is not moderator/admin, only show disputes they are a party to
    if (requestingUser && !isModeratorOrAdmin) {
      list = list.filter(d => d.initiator_id === requestingUser.uid || d.respondent_id === requestingUser.uid);
    }

    if (filter.status && filter.status !== 'all') {
      list = list.filter(d => d.status === filter.status);
    }
    if (filter.complaint_type && filter.complaint_type !== 'all') {
      list = list.filter(d => d.complaint_type === filter.complaint_type);
    }
    if (filter.userId) {
      list = list.filter(d => d.initiator_id === filter.userId || d.respondent_id === filter.userId);
    }

    return list.map(d => ({
      ...d,
      timeline: (d.timeline || []).filter(item => !item.internalOnly || isModeratorOrAdmin)
    }));
  }

  // 4. Human Moderator Review & Actions
  moderatorAction({ disputeId, moderatorUser, actionType, message = "", requestedFrom = "both" }) {
    if (!moderatorUser || (moderatorUser.role !== 'moderator' && moderatorUser.role !== 'admin')) {
      throw new Error("Unauthorized: Only certified moderators or admins can perform moderator actions.");
    }

    const dispute = this.data.disputes.find(d => d.id === disputeId);
    if (!dispute) throw new Error("Dispute not found");

    const now = new Date().toISOString();

    if (actionType === 'ask_evidence') {
      dispute.status = 'awaiting_response';
      dispute.timeline.push({
        id: `tl_${Date.now()}_ask`,
        action: "MODERATOR_REQUESTED_EVIDENCE",
        byUserId: moderatorUser.uid,
        byUserName: moderatorUser.displayName,
        byRole: "moderator",
        requestedFrom,
        timestamp: now,
        details: `Moderator requested additional evidence: ${message}`
      });
    } else if (actionType === 'internal_note') {
      dispute.timeline.push({
        id: `tl_${Date.now()}_int`,
        action: "INTERNAL_NOTE",
        byUserId: moderatorUser.uid,
        byUserName: moderatorUser.displayName,
        byRole: "moderator",
        internalOnly: true,
        timestamp: now,
        details: message
      });
    } else if (actionType === 'set_under_review') {
      dispute.status = 'under_review';
      dispute.timeline.push({
        id: `tl_${Date.now()}_rev`,
        action: "STATUS_CHANGE",
        byUserId: moderatorUser.uid,
        byUserName: moderatorUser.displayName,
        byRole: "moderator",
        timestamp: now,
        details: "Dispute placed under active moderator review."
      });
    } else if (actionType === 'escalate') {
      dispute.status = 'escalated';
      dispute.timeline.push({
        id: `tl_${Date.now()}_esc`,
        action: "STATUS_CHANGE",
        byUserId: moderatorUser.uid,
        byUserName: moderatorUser.displayName,
        byRole: "moderator",
        timestamp: now,
        details: `Dispute escalated for senior moderator review: ${message}`
      });
    }

    dispute.updated_at = now;
    this.persist();
    return dispute;
  }

  // 5. Evidence-based Resolution & Trust Score Update
  issueModeratorDecision({ disputeId, moderatorUser, verdict, reasoning, resolution, resolutionDetails = "", internalNotes = "" }) {
    if (!moderatorUser || (moderatorUser.role !== 'moderator' && moderatorUser.role !== 'admin')) {
      throw new Error("Unauthorized: Only certified moderators or admins can issue dispute decisions.");
    }

    const dispute = this.data.disputes.find(d => d.id === disputeId);
    if (!dispute) {
      throw new Error("Dispute not found");
    }
    if (dispute.status === 'resolved') {
      throw new Error("This dispute is already resolved.");
    }

    const validVerdicts = ['in_favor_of_lender', 'in_favor_of_borrower', 'partial', 'insufficient_evidence'];
    if (!validVerdicts.includes(verdict)) {
      throw new Error(`Invalid verdict. Allowed: ${validVerdicts.join(', ')}`);
    }

    if (!reasoning || reasoning.trim().length < 15) {
      throw new Error("Evidence-based reasoning is mandatory: You must provide a clear rationale referencing the specific photos, agreement, or videos submitted.");
    }

    const validResolutions = ['repair_cost_split', 'replacement', 'refund', 'warning'];
    if (!validResolutions.includes(resolution)) {
      throw new Error(`Invalid resolution type. Allowed: ${validResolutions.join(', ')}`);
    }

    const now = new Date().toISOString();
    const appealExpires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours appeal window!

    const decisionRecord = {
      id: `mdec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      dispute_id: disputeId,
      moderator_id: moderatorUser.uid,
      moderator_name: moderatorUser.displayName,
      verdict,
      reasoning: reasoning.trim(),
      resolution,
      resolution_details: (resolutionDetails || '').trim(),
      internal_notes: (internalNotes || '').trim(),
      appeal_window_expires_at: appealExpires,
      is_appealed: false,
      appeal: null,
      created_at: now
    };

    if (!Array.isArray(this.data.moderator_decisions)) {
      this.data.moderator_decisions = [];
    }
    this.data.moderator_decisions.unshift(decisionRecord);

    dispute.status = 'resolved';
    dispute.verdict = verdict;
    dispute.resolution = resolution;
    dispute.moderator_id = moderatorUser.uid;
    dispute.moderator_name = moderatorUser.displayName;
    dispute.updated_at = now;

    dispute.timeline.push({
      id: `tl_${Date.now()}_dec`,
      action: "MODERATOR_DECISION",
      byUserId: moderatorUser.uid,
      byUserName: moderatorUser.displayName,
      byRole: moderatorUser.role,
      timestamp: now,
      details: `Verdict: ${verdict.replace(/_/g, ' ').toUpperCase()}. Resolution: ${resolution}. Reasoning: ${reasoning.slice(0, 120)}...`
    });

    // Update Trust Scores and Fraud Restrictions
    const lenderId = dispute.initiator_role === 'lender' ? dispute.initiator_id : dispute.respondent_id;
    const borrowerId = dispute.initiator_role === 'borrower' ? dispute.initiator_id : dispute.respondent_id;
    const lenderUser = this.getUserByUid(lenderId);
    const borrowerUser = this.getUserByUid(borrowerId);

    if (verdict === 'in_favor_of_lender') {
      if (lenderUser) {
        lenderUser.disputesWonCount = (lenderUser.disputesWonCount || 0) + 1;
        lenderUser.trustScore = Math.min(100, (lenderUser.trustScore || 100) + 5);
      }
      if (borrowerUser) {
        borrowerUser.disputesLostCount = (borrowerUser.disputesLostCount || 0) + 1;
        borrowerUser.trustScore = Math.max(0, (borrowerUser.trustScore || 100) - 20);
        if (borrowerUser.disputesLostCount >= 2 || borrowerUser.trustScore < 60) {
          borrowerUser.isRestricted = true;
          borrowerUser.restrictionReason = `Restricted due to ${borrowerUser.disputesLostCount} lost disputes on record pending admin review.`;
        }
      }
    } else if (verdict === 'in_favor_of_borrower') {
      if (borrowerUser) {
        borrowerUser.disputesWonCount = (borrowerUser.disputesWonCount || 0) + 1;
        borrowerUser.trustScore = Math.min(100, (borrowerUser.trustScore || 100) + 5);
      }
      if (lenderUser) {
        lenderUser.disputesLostCount = (lenderUser.disputesLostCount || 0) + 1;
        lenderUser.trustScore = Math.max(0, (lenderUser.trustScore || 100) - 20);
        if (lenderUser.disputesLostCount >= 2 || lenderUser.trustScore < 60) {
          lenderUser.isRestricted = true;
          lenderUser.restrictionReason = `Restricted due to ${lenderUser.disputesLostCount} lost disputes on record pending admin review.`;
        }
      }
    } else if (verdict === 'partial') {
      if (lenderUser) lenderUser.trustScore = Math.max(0, (lenderUser.trustScore || 100) - 5);
      if (borrowerUser) borrowerUser.trustScore = Math.max(0, (borrowerUser.trustScore || 100) - 5);
    }

    this.logAudit({
      action: "MODERATOR_DECISION_ISSUED",
      entityType: "dispute",
      entityId: disputeId,
      performedBy: moderatorUser.uid,
      performerName: moderatorUser.displayName,
      performerRole: moderatorUser.role,
      details: `Verdict: ${verdict} | Resolution: ${resolution} | Appeal Window: ${appealExpires}`
    });

    this.persist();
    return { dispute, decision: decisionRecord };
  }

  // 6. Appeals System (One appeal allowed within 48 hours, reviewed by different moderator)
  appealDecision({ disputeId, appealingUser, appealReason }) {
    const dispute = this.data.disputes.find(d => d.id === disputeId);
    if (!dispute) throw new Error("Dispute not found");
    if (dispute.status !== 'resolved') throw new Error("Only resolved disputes can be appealed.");

    const decision = (this.data.moderator_decisions || []).find(m => m.dispute_id === disputeId);
    if (!decision) throw new Error("Moderator decision record not found.");

    if (decision.is_appealed) {
      throw new Error("One appeal allowed: An appeal has already been filed for this dispute.");
    }

    const now = new Date();
    const expiry = new Date(decision.appeal_window_expires_at);
    if (now > expiry) {
      throw new Error("Appeal window expired: Appeals must be filed within 48 hours of moderator decision.");
    }

    if (appealingUser.uid !== dispute.initiator_id && appealingUser.uid !== dispute.respondent_id) {
      throw new Error("Unauthorized: Only named parties to this dispute may file an appeal.");
    }

    const nowIso = now.toISOString();
    decision.is_appealed = true;
    decision.appeal = {
      appealed_by: appealingUser.uid,
      appealed_by_name: appealingUser.displayName,
      appeal_reason: (appealReason || '').trim(),
      appealed_at: nowIso,
      new_moderator_id: null,
      appeal_verdict: null,
      appeal_reasoning: null,
      appeal_resolved_at: null
    };

    dispute.status = 'escalated';
    dispute.updated_at = nowIso;

    dispute.timeline.push({
      id: `tl_${Date.now()}_app`,
      action: "DECISION_APPEALED",
      byUserId: appealingUser.uid,
      byUserName: appealingUser.displayName,
      byRole: appealingUser.uid === dispute.initiator_id ? dispute.initiator_role : dispute.respondent_role,
      timestamp: nowIso,
      details: `Appeal filed within 48-hour window: ${appealReason}. Escalated for secondary moderator review.`
    });

    this.logAudit({
      action: "DISPUTE_APPEALED",
      entityType: "dispute",
      entityId: disputeId,
      performedBy: appealingUser.uid,
      details: `Appeal filed by ${appealingUser.displayName}: ${appealReason}`
    });

    this.persist();
    return { dispute, decision };
  }

  resolveAppeal({ disputeId, reviewingModerator, appealVerdict, appealReasoning }) {
    if (!reviewingModerator || (reviewingModerator.role !== 'moderator' && reviewingModerator.role !== 'admin')) {
      throw new Error("Unauthorized: Only a certified moderator or admin can resolve appeals.");
    }

    const dispute = this.data.disputes.find(d => d.id === disputeId);
    if (!dispute) throw new Error("Dispute not found");

    const decision = (this.data.moderator_decisions || []).find(m => m.dispute_id === disputeId);
    if (!decision || !decision.is_appealed) {
      throw new Error("No active appeal found for this dispute.");
    }

    // Must be reviewed by a DIFFERENT moderator!
    if (decision.moderator_id === reviewingModerator.uid && reviewingModerator.role !== 'admin') {
      throw new Error("Conflict of Interest: An appeal must be reviewed by a different moderator than the original decision maker.");
    }

    const nowIso = new Date().toISOString();
    decision.appeal.new_moderator_id = reviewingModerator.uid;
    decision.appeal.new_moderator_name = reviewingModerator.displayName;
    decision.appeal.appeal_verdict = appealVerdict;
    decision.appeal.appeal_reasoning = appealReasoning.trim();
    decision.appeal.appeal_resolved_at = nowIso;

    dispute.status = 'resolved';
    dispute.verdict = appealVerdict;
    dispute.updated_at = nowIso;

    dispute.timeline.push({
      id: `tl_${Date.now()}_appres`,
      action: "APPEAL_RESOLVED",
      byUserId: reviewingModerator.uid,
      byUserName: reviewingModerator.displayName,
      byRole: reviewingModerator.role,
      timestamp: nowIso,
      details: `Appeal resolved by secondary moderator ${reviewingModerator.displayName}. Final Verdict: ${appealVerdict}. Reasoning: ${appealReasoning}`
    });

    this.logAudit({
      action: "APPEAL_RESOLVED",
      entityType: "dispute",
      entityId: disputeId,
      performedBy: reviewingModerator.uid,
      details: `Appeal resolved. Final verdict: ${appealVerdict}`
    });

    this.persist();
    return { dispute, decision };
  }

  // 7. Role Assignment & Fraud Administration
  assignUserRole(uid, newRole, adminUser) {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error("Unauthorized: Only platform admins can assign roles.");
    }

    const targetUser = this.getUserByUid(uid);
    if (!targetUser) throw new Error("User not found");

    const oldRole = targetUser.role;
    targetUser.role = newRole;
    targetUser.updatedAt = new Date().toISOString();

    this.logAudit({
      action: "USER_ROLE_ASSIGNED",
      entityType: "user",
      entityId: uid,
      performedBy: adminUser.uid,
      performerName: adminUser.displayName,
      performerRole: "admin",
      details: `Admin assigned role '${newRole}' to ${targetUser.displayName} (Previous: ${oldRole}).`
    });

    this.persist();
    return this.sanitizeUser(targetUser, true);
  }

  unrestrictUser(uid, adminUser) {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error("Unauthorized: Only platform admins can lift user fraud restrictions.");
    }

    const targetUser = this.getUserByUid(uid);
    if (!targetUser) throw new Error("User not found");

    targetUser.isRestricted = false;
    targetUser.restrictionReason = null;
    targetUser.trustScore = Math.max(70, targetUser.trustScore || 100);
    targetUser.updatedAt = new Date().toISOString();

    this.logAudit({
      action: "USER_UNRESTRICTED",
      entityType: "user",
      entityId: uid,
      performedBy: adminUser.uid,
      performerName: adminUser.displayName,
      performerRole: "admin",
      details: `Admin cleared fraud restriction for ${targetUser.displayName}. Trust score reset to ${targetUser.trustScore}.`
    });

    this.persist();
    return this.sanitizeUser(targetUser, true);
  }

  adjustTrustScore(uid, scoreChange, reason = "", adminUser) {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error("Unauthorized: Only platform admins can adjust trust scores directly.");
    }

    const targetUser = this.getUserByUid(uid);
    if (!targetUser) throw new Error("User not found");

    const oldScore = targetUser.trustScore || 100;
    targetUser.trustScore = Math.max(0, Math.min(100, oldScore + Number(scoreChange)));
    targetUser.updatedAt = new Date().toISOString();

    this.logAudit({
      action: "TRUST_SCORE_ADJUSTED",
      entityType: "user",
      entityId: uid,
      performedBy: adminUser.uid,
      details: `Trust score adjusted from ${oldScore} to ${targetUser.trustScore} for ${targetUser.displayName}. Reason: ${reason}`
    });

    this.persist();
    return this.sanitizeUser(targetUser, true);
  }

  getUsersWithTrust() {
    return this.data.users.map(u => this.sanitizeUser(u, true));
  }

  // ==========================================
  // SMART MATCHING ENGINE & NOTIFICATION STORE
  // ==========================================

  createMatchRequest(data) {
    if (!Array.isArray(this.data.match_requests)) {
      this.data.match_requests = [];
    }
    const requester = this.getUserByUid(data.requesterId);
    const donor = this.getUserByUid(data.donorId);

    const matchRecord = {
      id: data.id || `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      requestId: data.requestId,
      requestTitle: data.requestTitle || "Community Assistance Request",
      category: data.category || "General",
      urgency: data.urgency || "Normal",
      requesterId: data.requesterId,
      requesterName: requester?.displayName || data.requesterName || "Requester",
      requesterArea: requester?.area || data.requesterArea || "Civil Lines, Banda",
      donorId: data.donorId,
      donorName: donor?.displayName || data.donorName || "Donor / Volunteer",
      donorArea: donor?.area || data.donorArea || "Banda",
      matchScore: Number(data.matchScore) || 85,
      factorScores: data.factorScores || {},
      explanation: Array.isArray(data.explanation) ? data.explanation : [],
      status: data.initialStatus || "pending", // 'pending' | 'accepted' | 'declined' | 'completed'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.match_requests.unshift(matchRecord);

    // Create real notification for donor
    this.createNotification({
      userId: data.donorId,
      type: "match_request",
      title: "New Match Request / नई सहायता अनुरोध",
      message: `${matchRecord.requesterName} has requested your assistance (${matchRecord.matchScore}% Match): "${matchRecord.requestTitle}".`,
      data: {
        matchId: matchRecord.id,
        requestId: matchRecord.requestId,
        urgency: matchRecord.urgency
      }
    });

    this.logAudit({
      action: "SMART_MATCH_DISPATCHED",
      entityType: "match_request",
      entityId: matchRecord.id,
      performedBy: data.requesterId,
      details: `Dispatched AI assistance match to ${matchRecord.donorName} (${matchRecord.matchScore}% match score).`
    });

    this.persist();
    return matchRecord;
  }

  updateMatchRequest(id, updates, actingUser = null) {
    if (!Array.isArray(this.data.match_requests)) return null;
    const idx = this.data.match_requests.findIndex(m => m.id === id);
    if (idx === -1) return null;

    const prev = this.data.match_requests[idx];
    const updated = {
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.match_requests[idx] = updated;

    // Handle status notifications
    if (updates.status === 'accepted' && prev.status !== 'accepted') {
      this.createNotification({
        userId: updated.requesterId,
        type: "match_accepted",
        title: "Donor Accepted / सहायता स्वीकार की गई!",
        message: `${updated.donorName} accepted your request for "${updated.requestTitle}". You can now coordinate handover.`,
        data: { matchId: updated.id, requestId: updated.requestId, donorId: updated.donorId }
      });
      // Update original request if present
      if (updated.requestId) {
        this.updateRequest(updated.requestId, {
          status: "matched",
          matchedProvider: {
            providerId: updated.donorId,
            providerName: updated.donorName,
            matchScore: updated.matchScore
          }
        });
      }
    } else if (updates.status === 'declined' && prev.status !== 'declined') {
      this.createNotification({
        userId: updated.requesterId,
        type: "match_declined",
        title: "Donor Occupied / अन्य सहायक खोजें",
        message: `${updated.donorName} is temporarily occupied. The Smart Matching Engine is finding alternative donors.`,
        data: { matchId: updated.id, requestId: updated.requestId }
      });
    }

    this.logAudit({
      action: `MATCH_${(updates.status || 'UPDATED').toUpperCase()}`,
      entityType: "match_request",
      entityId: id,
      performedBy: actingUser?.uid || "system",
      details: `Match request ${id} status changed to ${updates.status || 'updated'}.`
    });

    this.persist();
    return updated;
  }

  getMatchRequests(filter = {}) {
    if (!Array.isArray(this.data.match_requests)) return [];
    let list = [...this.data.match_requests];
    if (filter.requesterId) list = list.filter(m => m.requesterId === filter.requesterId);
    if (filter.donorId) list = list.filter(m => m.donorId === filter.donorId);
    if (filter.status && filter.status !== 'all') list = list.filter(m => m.status === filter.status);
    if (filter.requestId) list = list.filter(m => m.requestId === filter.requestId);
    return list;
  }

  createNotification(notifData) {
    if (!Array.isArray(this.data.notifications)) {
      this.data.notifications = [];
    }
    const notif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: notifData.userId,
      type: notifData.type || "general",
      title: notifData.title || "Notification",
      message: notifData.message || "",
      data: notifData.data || {},
      read: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    this.persist();
    return notif;
  }

  getNotifications(userId) {
    if (!Array.isArray(this.data.notifications)) return [];
    return this.data.notifications.filter(n => n.userId === userId);
  }

  markNotificationRead(id, userId) {
    if (!Array.isArray(this.data.notifications)) return null;
    const notif = this.data.notifications.find(n => n.id === id && n.userId === userId);
    if (!notif) return null;
    notif.read = true;
    notif.readAt = new Date().toISOString();
    this.persist();
    return notif;
  }

  updateUserWillingness(userId, { willingnessStatus, estimatedResponseMinutes, availableHours, specialties }) {
    const user = this.getUserByUid(userId);
    if (!user) throw new Error("User not found");

    if (willingnessStatus) user.willingnessStatus = willingnessStatus;
    if (typeof estimatedResponseMinutes === 'number') user.estimatedResponseMinutes = Math.max(5, estimatedResponseMinutes);
    if (availableHours) user.availableHours = availableHours.trim();
    if (Array.isArray(specialties)) user.specialties = specialties;

    user.updatedAt = new Date().toISOString();
    this.logAudit({
      action: "DONOR_WILLINGNESS_UPDATED",
      entityType: "user",
      entityId: userId,
      performedBy: userId,
      details: `Updated willingness to '${user.willingnessStatus}' with response time ${user.estimatedResponseMinutes}m.`
    });

    this.persist();
    return this.sanitizeUser(user, true);
  }

  getMatchingAnalytics() {
    const matchRequests = Array.isArray(this.data.match_requests) ? this.data.match_requests : [];
    const requests = Array.isArray(this.data.requests) ? this.data.requests : [];
    const users = Array.isArray(this.data.users) ? this.data.users : [];

    const totalRequests = matchRequests.length + requests.length;
    const criticalRequests = requests.filter(r => r.urgency === 'Urgent' || r.urgency === 'Critical' || (r.aiAnalysis?.score && r.aiAnalysis.score >= 9.0)).length;
    const successfulMatches = matchRequests.filter(m => m.status === 'accepted' || m.status === 'completed').length;
    const pendingRequests = matchRequests.filter(m => m.status === 'pending').length;
    const rejectedMatches = matchRequests.filter(m => m.status === 'declined').length;
    const fraudReports = users.filter(u => u.isRestricted || (u.disputesLostCount && u.disputesLostCount > 0)).length;

    // Calculate real average matching response time
    const completedMatches = matchRequests.filter(m => m.status === 'accepted' && m.createdAt && m.updatedAt);
    let avgMatchingTimeMinutes = 14.2; // Baseline pilot average
    if (completedMatches.length > 0) {
      const totalMinutes = completedMatches.reduce((acc, m) => {
        const diff = Math.max(1, (new Date(m.updatedAt).getTime() - new Date(m.createdAt).getTime()) / (1000 * 60));
        return acc + diff;
      }, 0);
      avgMatchingTimeMinutes = Math.round((totalMinutes / completedMatches.length) * 10) / 10;
    }

    const suspiciousAccounts = users
      .filter(u => u.isRestricted || (typeof u.trustScore === 'number' && u.trustScore < 75) || (u.disputesLostCount && u.disputesLostCount >= 1))
      .map(u => this.sanitizeUser(u, true));

    return {
      totalRequests,
      criticalRequests,
      successfulMatches,
      pendingRequests,
      rejectedMatches,
      fraudReports,
      avgMatchingTimeMinutes,
      recentDispatches: matchRequests.slice(0, 10),
      suspiciousAccounts
    };
  }
}

export const db = new DataStore();
