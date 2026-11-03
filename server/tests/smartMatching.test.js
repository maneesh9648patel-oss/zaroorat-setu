/**
 * ZarooratSetu - AI Smart Matching Engine Test Suite
 * Tests 6-factor weighted algorithm, emergency prioritization,
 * distance calculation, notifications, and admin analytics.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { SmartMatchingEngine } from '../services/smartMatchingEngine.js';
import { db } from '../config/store.js';

test('AI-Based Smart Matching Engine Specification', async (t) => {
  const requester = db.getUserByUid('usr_aarav');
  const donorPriya = db.getUserByUid('usr_donor_priya');
  const ngoSeva = db.getUserByUid('usr_ngo_01');
  const admin = db.getUserByUid('usr_admin');

  assert.ok(requester, "Requester exists in db");
  assert.ok(donorPriya, "Donor Priya exists in db");
  assert.ok(ngoSeva, "NGO Seva exists in db");

  await t.test('1. Six-Factor Weighted Algorithm & Maximum 100 Points Model', () => {
    // Critical request test
    const criticalReq = {
      id: "req_test_crit",
      title: "Urgent B+ blood required for emergency surgery",
      description: "Patient in OT at District Hospital Banda. Surgery starting in 1 hour.",
      category: "Medical",
      urgency: "Urgent",
      coordinates: { lat: 25.4810, lng: 80.3410 } // District Hospital
    };

    const evaluation = SmartMatchingEngine.evaluateCandidate({
      request: criticalReq,
      candidate: donorPriya,
      items: db.getItems()
    });

    assert.ok(evaluation, "Evaluation produced a match");
    assert.ok(evaluation.matchScore > 80, `Expected high match score, got ${evaluation.matchScore}`);

    // Verify 6 factors exist and add up to matchScore
    const factors = evaluation.factorScores;
    assert.equal(factors.emergencyPriority.max, 25, "Emergency factor max 25");
    assert.equal(factors.distance.max, 20, "Distance factor max 20");
    assert.equal(factors.resourceAvailability.max, 20, "Resource factor max 20");
    assert.equal(factors.timeCompatibility.max, 15, "Time factor max 15");
    assert.equal(factors.verificationTrust.max, 10, "Trust factor max 10");
    assert.equal(factors.donorWillingness.max, 10, "Willingness factor max 10");

    const sum = factors.emergencyPriority.score +
      factors.distance.score +
      factors.resourceAvailability.score +
      factors.timeCompatibility.score +
      factors.verificationTrust.score +
      factors.donorWillingness.score;

    assert.equal(evaluation.matchScore, Math.round(sum));
    assert.ok(evaluation.matchScore <= 100, "Score does not exceed 100");
  });

  await t.test('2. Emergency Priority Classification (Critical at Top & Medical Disclaimer)', () => {
    const bloodReq = { title: "Need B+ blood for transfusion", category: "Medical", urgency: "Urgent" };
    const classBlood = SmartMatchingEngine.classifyEmergencyLevel(bloodReq);
    assert.equal(classBlood.level, "Critical");
    assert.equal(classBlood.points, 25);
    assert.equal(classBlood.medicalAlert, true);

    const normalReq = { title: "Math Semester 4 textbook", category: "Education", urgency: "Normal" };
    const classNormal = SmartMatchingEngine.classifyEmergencyLevel(normalReq);
    assert.equal(classNormal.level, "Normal");
    assert.equal(classNormal.points, 7);
    assert.equal(classNormal.medicalAlert, false);

    // Matches with Critical requests must show medical disclaimer
    const results = SmartMatchingEngine.findSmartMatches({ request: bloodReq });
    assert.ok(results.medicalDisclaimer, "Medical disclaimer included for critical medical request");
    assert.match(results.medicalDisclaimer, /108\/112/);
  });

  await t.test('3. Smart Distance Matching (0-2km: 20pts, 2-5km: 16pts, 5-10km: 12pts)', () => {
    const baseCoords = { lat: 25.4764, lng: 80.3344 }; // Civil Lines
    
    // Exact same location (0 km)
    const d0 = SmartMatchingEngine.evaluateDistance(baseCoords, baseCoords);
    assert.equal(d0.points, 20);
    assert.equal(d0.distanceKm, 0);

    // Nearby location (~1.0 km)
    const d1 = SmartMatchingEngine.evaluateDistance(baseCoords, { lat: 25.4810, lng: 80.3410 });
    assert.ok(d1.distanceKm <= 2.0);
    assert.equal(d1.points, 20);

    // REC Banda (~7.5 km from Civil Lines)
    const dRec = SmartMatchingEngine.evaluateDistance(baseCoords, { lat: 25.5348, lng: 80.3478 });
    assert.ok(dRec.distanceKm > 5.0 && dRec.distanceKm <= 10.0);
    assert.equal(dRec.points, 12);
  });

  await t.test('4. Resource Availability & Inventory Cross-Referencing', () => {
    // Wheelchair request
    const wheelchairReq = {
      title: "Need Wheelchair for 2 weeks",
      category: "Items",
      urgency: "High"
    };

    // Candidate Seva Sahayata Trust has wheelchair item in db
    const resEval = SmartMatchingEngine.evaluateResource(wheelchairReq, ngoSeva, db.getItems());
    assert.ok(resEval.available, "Resource detected as available");
    assert.ok(resEval.points >= 15, "Awarded high resource points for available inventory");
  });

  await t.test('5. Verification & Trust System (mAadhaar, KYC, Fraud Restriction)', () => {
    const trustPriya = SmartMatchingEngine.evaluateVerificationAndTrust(donorPriya);
    assert.ok(trustPriya.points >= 6.0, "Verified donor with clean record receives high base trust");

    // Fully mAadhaar-verified candidate receives top points
    const verifiedCandidate = {
      ...donorPriya,
      aadhaarVerification: { verified: true, name: "Priya Verma", last4: "8899" }
    };
    const trustVerified = SmartMatchingEngine.evaluateVerificationAndTrust(verifiedCandidate);
    assert.ok(trustVerified.points >= 9.5, "mAadhaar QR verified candidate receives top 9.5+ points");

    // Restricted user gets 0 points and is excluded from matching
    const restrictedUser = {
      uid: "usr_restricted_test",
      displayName: "Flagged User",
      role: "donor",
      isRestricted: true,
      trustScore: 40
    };
    const trustRestricted = SmartMatchingEngine.evaluateVerificationAndTrust(restrictedUser);
    assert.equal(trustRestricted.points, 0);

    const matchRestricted = SmartMatchingEngine.evaluateCandidate({
      request: { title: "Wheelchair", category: "Items" },
      candidate: restrictedUser,
      items: db.getItems()
    });
    assert.equal(matchRestricted, null, "Restricted candidate excluded from matching results");
  });

  await t.test('6. Donor Willingness (Only Willing Donors Included)', () => {
    const willingUser = {
      ...donorPriya,
      willingnessStatus: 'available_willing'
    };
    const w1 = SmartMatchingEngine.evaluateWillingness(willingUser);
    assert.equal(w1.points, 10);
    assert.equal(w1.isWilling, true);

    const busyUser = {
      ...donorPriya,
      willingnessStatus: 'temporarily_unavailable'
    };
    const wBusy = SmartMatchingEngine.evaluateWillingness(busyUser);
    assert.equal(wBusy.points, 0);
    assert.equal(wBusy.isWilling, false);

    const matchBusy = SmartMatchingEngine.evaluateCandidate({
      request: { title: "Oxygen Cylinder", category: "Medical" },
      candidate: busyUser,
      items: db.getItems()
    });
    assert.equal(matchBusy, null, "Unavailable donor is not recommended as a match");
  });

  await t.test('7. "Why This Match?" Explanation Breakdown', () => {
    const req = {
      title: "Wheelchair for 2 weeks",
      category: "Items",
      urgency: "High",
      coordinates: { lat: 25.4764, lng: 80.3344 }
    };

    const match = SmartMatchingEngine.evaluateCandidate({
      request: req,
      candidate: ngoSeva,
      items: db.getItems()
    });

    assert.ok(match.reasons.length >= 4, "Provides at least 4 clear bullet reasons");
    assert.ok(match.aiSummary, "Provides AI summary text");
    assert.ok(match.reasons.some(r => r.includes("Nearby location")), "Explains location proximity");
  });

  await t.test('8. Assistance Request Dispatch & Notification Flow', () => {
    // 1. Dispatch match request
    const matchRecord = db.createMatchRequest({
      requestId: "req_1042",
      requestTitle: "Wheelchair for 2 weeks",
      category: "Items",
      urgency: "High",
      requesterId: requester.uid,
      requesterName: requester.displayName,
      donorId: ngoSeva.uid,
      donorName: ngoSeva.displayName,
      matchScore: 92,
      factorScores: {},
      explanation: ["Nearby location", "Resource available"]
    });

    assert.ok(matchRecord.id.startsWith("match_"));
    assert.equal(matchRecord.status, "pending");

    // 2. Verify donor received notification
    const donorNotifs = db.getNotifications(ngoSeva.uid);
    assert.ok(donorNotifs.some(n => n.type === 'match_request' && n.data?.matchId === matchRecord.id));

    // 3. Donor accepts request
    const accepted = db.updateMatchRequest(matchRecord.id, {
      status: "accepted"
    }, ngoSeva);
    assert.equal(accepted.status, "accepted");

    // 4. Verify requester received acceptance notification
    const requesterNotifs = db.getNotifications(requester.uid);
    assert.ok(requesterNotifs.some(n => n.type === 'match_accepted' && n.data?.matchId === matchRecord.id));
  });

  await t.test('9. Admin Analytics Control Panel', () => {
    const analytics = db.getMatchingAnalytics();
    assert.ok(typeof analytics.totalRequests === 'number');
    assert.ok(typeof analytics.criticalRequests === 'number');
    assert.ok(typeof analytics.successfulMatches === 'number');
    assert.ok(typeof analytics.avgMatchingTimeMinutes === 'number');
    assert.ok(Array.isArray(analytics.recentDispatches));
    assert.ok(Array.isArray(analytics.suspiciousAccounts));
  });
});
