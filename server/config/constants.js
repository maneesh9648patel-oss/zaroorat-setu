/**
 * ZarooratSetu - System Constants & Pilot Config (REC Banda)
 */

export const PILOT_AREAS = [
  { name: "REC Banda", lat: 25.5348, lng: 80.3478, description: "Rajkiya Engineering College Campus & Surroundings" },
  { name: "Civil Lines", lat: 25.4764, lng: 80.3344, description: "Central Banda Residential & Commercial Hub" },
  { name: "District Hospital Banda", lat: 25.4810, lng: 80.3410, description: "District Hospital & Medical Corridor" },
  { name: "Baberu", lat: 25.5500, lng: 80.5500, description: "Baberu Tehsil & Rural Link" },
  { name: "Atarra", lat: 25.3000, lng: 80.5700, description: "Atarra Mandi & Railway Belt" },
  { name: "Tindwari", lat: 25.6100, lng: 80.5300, description: "Northern Community Cluster" },
  { name: "Naraini", lat: 25.1900, lng: 80.4800, description: "Southern Border Tehsil" }
];

export const USER_ROLES = {
  NEEDER: "needer",
  DONOR: "donor",
  LENDER: "lender",
  VERIFIER: "verifier",
  NGO: "ngo",
  ADMIN: "admin"
};

export const KYC_TIERS = {
  NONE: "none",
  LEVEL_1: "level_1", // Basic Verified (OTP Phone & Email)
  LEVEL_2: "level_2", // Additional ID Verified (Lenders & Donors)
  LEVEL_3: "level_3"  // Verified NGO (Registration & Admin Approval)
};

export const KYC_STATUS = {
  UNVERIFIED: "unverified",
  BASIC_VERIFIED: "basic_verified", // OTP only - NEVER "complete KYC"
  PENDING_ID_REVIEW: "pending_id_review",
  FULLY_VERIFIED: "fully_verified"
};

export const REQUEST_CATEGORIES = ["Education", "Medical", "Items", "Emergency"];

export const URGENCY_LEVELS = {
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent"
};

export const DEMO_OTP = "123456";
