/**
 * ZarooratSetu - Dispute Resolution & Integrity System Tests
 * Tests all 6 modules:
 * 1. Before-borrowing condition photos (2-6 photos, server timestamp, confirmation)
 * 2. After-return condition photos (side-by-side comparison)
 * 3. Digital agreement (locked once signed, clauses, signatures)
 * 4. Both-side complaint & counter-evidence filing (3-day deadline, immutable)
 * 5. Human moderator review queue & internal notes
 * 6. Evidence-based resolution, 48-hour appeal, trust score & fraud restrictions
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../config/store.js';

test('Dispute Resolution & Integrity System Specification', async (t) => {
  // Setup demo counterparties and transaction for testing
  const lender = db.getUserByUid('usr_donor_priya');
  const borrower = db.getUserByUid('usr_aarav');
  const moderator1 = db.getUserByUid('usr_moderator_01');
  const moderator2 = db.getUserByUid('usr_moderator_02');
  const admin = db.getUserByUid('usr_admin');

  assert.ok(lender, "Lender usr_donor_priya exists");
  assert.ok(borrower, "Borrower usr_aarav exists");
  assert.ok(moderator1, "Moderator 1 usr_moderator_01 exists");
  assert.ok(moderator2, "Moderator 2 usr_moderator_02 exists");

  // Ensure borrower is clean of past test restriction runs
  const cleanBorrower = db.updateUser(borrower.uid, { isRestricted: false, restrictionReason: null, disputesLostCount: 0 }) || borrower;
  cleanBorrower.isRestricted = false;

  // Create clean test item & transaction
  const item = db.createItem({
    name: "Dell Latitude 7490 Laptop (Core i5/16GB/256GB SSD)",
    category: "Electronics",
    quantity: 1,
    owner_id: lender.uid,
    loanPeriodDays: 7,
    condition: "Good - Minor scratches on lid, screen flawless"
  });

  const takeResult = db.takeItem({
    itemId: item.id,
    quantity: 1,
    duration_days: 7,
    receiverUser: cleanBorrower
  });
  const txn = takeResult.transaction;
  assert.ok(txn, "Take transaction created");

  await t.test('1. Before-Borrowing Condition Photos (2 to 6 photos, server timestamp, confirmation)', () => {
    // Rejects less than 2 photos
    assert.throws(() => {
      db.saveConditionPhotos({
        transactionId: txn.id,
        stage: 'before_borrow',
        uploaderId: lender.uid,
        uploaderRole: 'lender',
        photos: ['data:image/jpeg;base64,1234']
      });
    }, /between 2 and 6 photos/);

    // Rejects more than 6 photos
    assert.throws(() => {
      db.saveConditionPhotos({
        transactionId: txn.id,
        stage: 'before_borrow',
        uploaderId: lender.uid,
        uploaderRole: 'lender',
        photos: Array(7).fill('data:image/jpeg;base64,1234')
      });
    }, /between 2 and 6 photos/);

    // Accepts 3 valid before photos with optional note
    const beforeRecord = db.saveConditionPhotos({
      transactionId: txn.id,
      stage: 'before_borrow',
      uploaderId: lender.uid,
      uploaderRole: 'lender',
      photos: [
        'https://example.com/laptop_screen_on.jpg',
        'https://example.com/laptop_keyboard.jpg',
        'https://example.com/laptop_ports.jpg'
      ],
      conditionNote: "Screen flawless. Keyboard and all USB ports tested working."
    });

    assert.equal(beforeRecord.photos.length, 3);
    assert.equal(beforeRecord.stage, 'before_borrow');
    assert.equal(beforeRecord.confirmed_by_other, false);

    // Check that each photo has server timestamp and uploader_id
    for (const photo of beforeRecord.photos) {
      assert.ok(photo.timestamp, "Server sets timestamp on photo");
      assert.equal(photo.uploader_id, lender.uid);
    }

    // Uploader cannot confirm their own photos
    assert.throws(() => {
      db.confirmCondition({
        transactionId: txn.id,
        stage: 'before_borrow',
        userId: lender.uid
      });
    }, /cannot confirm your own/);

    // Borrower confirms condition
    const confirmed = db.confirmCondition({
      transactionId: txn.id,
      stage: 'before_borrow',
      userId: borrower.uid
    });
    assert.equal(confirmed.confirmed_by_other, true);
    assert.equal(confirmed.confirmed_by_id, borrower.uid);
    assert.ok(confirmed.confirmed_at);
  });

  await t.test('2. Digital Agreement Auto-generation, Signing & Locking', () => {
    const agreement = db.generateAgreement({
      transactionId: txn.id,
      lenderId: lender.uid,
      borrowerId: borrower.uid,
      conditionSummary: "Screen flawless, minor casing scratches, all ports functional."
    });

    assert.ok(agreement.id.startsWith('agr_'));
    assert.equal(agreement.item_name, item.name);
    assert.equal(agreement.lender_id, lender.uid);
    assert.equal(agreement.borrower_id, borrower.uid);
    assert.ok(agreement.clauses.damage_loss_clause, "Has damage/loss responsibility clause");
    assert.ok(agreement.clauses.dispute_process_clause, "Has dispute resolution process clause");
    assert.equal(agreement.is_locked, false);

    // Lender signs agreement
    const signedLender = db.signAgreement({
      agreementId: agreement.id,
      userId: lender.uid,
      ip: '192.168.1.10'
    });
    assert.equal(signedLender.lender_agreed, true);
    assert.equal(signedLender.is_locked, false, "Not locked until both agree");

    // Borrower signs agreement
    const signedBoth = db.signAgreement({
      agreementId: agreement.id,
      userId: borrower.uid,
      ip: '192.168.1.20'
    });
    assert.equal(signedBoth.borrower_agreed, true);
    assert.equal(signedBoth.is_locked, true, "Agreement is permanently locked after both agree");
    assert.ok(signedBoth.locked_at);
  });

  await t.test('3. After-Return Condition Photos & Side-by-Side Comparison', () => {
    // Borrower uploads return photos
    const borrowerReturn = db.saveConditionPhotos({
      transactionId: txn.id,
      stage: 'after_return',
      uploaderId: borrower.uid,
      uploaderRole: 'borrower',
      photos: [
        'https://example.com/return_laptop_closed.jpg',
        'https://example.com/return_laptop_display.jpg'
      ],
      conditionNote: "Returned safely with charger in carry sleeve."
    });
    assert.equal(borrowerReturn.photos.length, 2);

    // Lender uploads their inspection return photos
    const lenderReturn = db.saveConditionPhotos({
      transactionId: txn.id,
      stage: 'after_return',
      uploaderId: lender.uid,
      uploaderRole: 'lender',
      photos: [
        'https://example.com/lender_check_display_flicker.jpg',
        'https://example.com/lender_check_hinge_crack.jpg'
      ],
      conditionNote: "Left hinge plastic cover has hairline crack and screen flickers when moved."
    });
    assert.equal(lenderReturn.photos.length, 2);

    // Side-by-side photo inspection
    const comparison = db.getConditionPhotos(txn.id);
    assert.ok(comparison.beforeBorrow.length >= 1, "Has before-borrow photos");
    assert.ok(comparison.afterReturn.length >= 2, "Has after-return photos from both sides");
  });

  let disputeId = null;

  await t.test('4. Both-Side Complaint Option & 3-Day Response Window', () => {
    // Lender raises damage complaint
    const result = db.createDispute({
      transactionId: txn.id,
      initiatorId: lender.uid,
      complaintType: 'damage',
      description: "Laptop screen flickers intermittently and left hinge cover has hairline crack not present in baseline condition photos.",
      desiredResolution: "₹1,200 repair cost split for hinge assembly replacement at REC Banda authorized repair desk.",
      evidenceFiles: [
        {
          id: 'ev_hinge_photo',
          url: 'https://example.com/hinge_crack_zoom.jpg',
          name: 'hinge_crack_zoom.jpg',
          type: 'photo'
        }
      ]
    });

    assert.ok(result.dispute);
    disputeId = result.dispute.id;
    assert.equal(result.dispute.status, 'open');
    assert.equal(result.dispute.complaint_type, 'damage');
    assert.equal(result.dispute.initiator_id, lender.uid);
    assert.equal(result.dispute.respondent_id, borrower.uid);

    // Response deadline is set to 3 days
    const deadlineDiff = new Date(result.dispute.response_deadline).getTime() - Date.now();
    assert.ok(deadlineDiff > 2.5 * 24 * 60 * 60 * 1000, "Response deadline is 3 days in future");

    // Borrower submits response and counter-evidence within 3 days
    const respResult = db.submitDisputeResponse({
      disputeId,
      respondentId: borrower.uid,
      responseText: "The laptop was kept on my study desk the entire week. The screen cable had a tiny flicker before as well. Willing to contribute ₹500 towards student club repair.",
      counterProposal: "₹500 contribution towards repair",
      evidenceFiles: [
        {
          id: 'ev_borrower_desk',
          url: 'https://example.com/laptop_on_desk.jpg',
          name: 'laptop_on_desk.jpg',
          type: 'photo'
        }
      ]
    });

    assert.equal(respResult.dispute.has_response, true);
    assert.equal(respResult.dispute.status, 'under_review');
    assert.ok(respResult.response);
  });

  await t.test('5. Human Moderator Review: Queue, Internal Notes & Questions', () => {
    // Moderator views the dispute queue
    const queue = db.getDisputes({ status: 'under_review' }, moderator1);
    assert.ok(queue.some(d => d.id === disputeId));

    // Non-party, non-moderator regular user is BLOCKED from accessing dispute details (Role-Based Access)
    const randomUser = db.getUserByUid('usr_student_rec');
    assert.throws(() => {
      db.getDisputeById(disputeId, randomUser);
    }, /FORBIDDEN/);

    // Moderator can access full dispute details
    const fullDispute = db.getDisputeById(disputeId, moderator1);
    assert.ok(fullDispute.agreement, "Moderator views agreement");
    assert.ok(fullDispute.conditionPhotos, "Moderator views before/after photos");
    assert.ok(fullDispute.evidence.length >= 2, "Moderator views all evidence");

    // Moderator asks borrower for more evidence
    db.moderatorAction({
      disputeId,
      moderatorUser: moderator1,
      actionType: 'ask_evidence',
      message: "Please clarify if the laptop was transported outdoors during the loan period.",
      requestedFrom: 'respondent'
    });
    const updated = db.getDisputeById(disputeId, moderator1);
    assert.equal(updated.status, 'awaiting_response');

    // Moderator adds internal note (invisible to users)
    db.moderatorAction({
      disputeId,
      moderatorUser: moderator1,
      actionType: 'internal_note',
      message: "Preliminary assessment: Before-photo #1 shows no hinge crack. Return photo clearly shows hairline fracture. Physical impact likely occurred during custody."
    });

    // Check that internal note is hidden from borrower
    const userView = db.getDisputeById(disputeId, borrower);
    const hasInternalNote = userView.timeline.some(t => t.internalOnly);
    assert.equal(hasInternalNote, false, "Internal notes are invisible to users");
  });

  await t.test('6. Evidence-Based Resolution, Trust Score, Fraud Flag & Appeal', () => {
    const borrowerInitialTrust = borrower.trustScore;

    // Moderator issues decision
    const decisionResult = db.issueModeratorDecision({
      disputeId,
      moderatorUser: moderator1,
      verdict: 'in_favor_of_lender',
      reasoning: "Comparative inspection of Before-Photo #1 (flawless hinge) against Return-Photo #2 establishes that hinge structural damage occurred during borrower custody. Agreement clause 4.1 assigns loss/damage responsibility to borrower.",
      resolution: 'repair_cost_split',
      resolutionDetails: "Borrower pays ₹800; Lender absorbs ₹400 for age wear and tear.",
      internalNotes: "Fair balance struck given student budget."
    });

    assert.equal(decisionResult.dispute.status, 'resolved');
    assert.equal(decisionResult.decision.verdict, 'in_favor_of_lender');
    assert.ok(decisionResult.decision.appeal_window_expires_at, "Opens 48-hour appeal window");

    // Check Trust Score update: Borrower lost dispute -> score deducted by 20
    const updatedBorrower = db.getUserByUid(borrower.uid);
    assert.equal(updatedBorrower.disputesLostCount, 1);
    assert.equal(updatedBorrower.trustScore, borrowerInitialTrust - 20);

    // Test 48-hour Appeal by borrower
    const appealResult = db.appealDecision({
      disputeId,
      appealingUser: borrower,
      appealReason: "The hinge plastic had an existing stress line that expanded in normal opening. Request secondary review of Before-Photo #1 zoom."
    });
    assert.equal(appealResult.dispute.status, 'escalated');
    assert.equal(appealResult.decision.is_appealed, true);

    // Conflict of Interest Check: Original moderator CANNOT resolve appeal!
    assert.throws(() => {
      db.resolveAppeal({
        disputeId,
        reviewingModerator: moderator1,
        appealVerdict: 'partial',
        appealReasoning: "Re-reviewing my own decision."
      });
    }, /Conflict of Interest/);

    // Secondary moderator resolves appeal
    const appealResolved = db.resolveAppeal({
      disputeId,
      reviewingModerator: moderator2,
      appealVerdict: 'partial',
      appealReasoning: "High-magnification inspection confirms faint stress micro-fracture on factory joint. Both parties shall split repair 50-50 (₹600 each)."
    });
    assert.equal(appealResolved.dispute.status, 'resolved');
    assert.equal(appealResolved.decision.appeal.new_moderator_id, moderator2.uid);
  });

  await t.test('7. Fraud Restriction Enforcement (Repeated dispute losers blocked from give/take)', () => {
    // Simulate user who repeatedly loses disputes (2 lost disputes)
    let badUser = db.getUserByUid("usr_bad_actor");
    if (badUser) {
      badUser = db.updateUser("usr_bad_actor", { isRestricted: true, disputesLostCount: 2 });
    } else {
      badUser = db.createUser({
        uid: "usr_bad_actor",
        displayName: "Careless User",
        role: "needer",
        phone: "+919811998877",
        email: "bad.actor@example.com",
        kycLevel: "level_2",
        kycStatus: "fully_verified",
        aadhaarVerification: { verified: true, name: "Careless User", last4: "7766" },
        disputesLostCount: 2,
        trustScore: 40,
        isRestricted: true,
        restrictionReason: "Restricted due to 2 lost disputes on record pending admin review."
      });
    }

    // Restricted user is BLOCKED from taking items
    assert.throws(() => {
      db.takeItem({
        itemId: item.id,
        quantity: 1,
        receiverUser: badUser
      });
    }, /restricted from borrowing/);

    // Restricted user is BLOCKED from giving items
    assert.throws(() => {
      db.createItem({
        name: "Test item",
        category: "Study Material",
        owner_id: badUser.uid,
        ownerId: badUser.uid
      });
    }, /restricted from lending/);

    // Admin can lift restriction
    const unbanned = db.unrestrictUser(badUser.uid, admin);
    assert.equal(unbanned.isRestricted, false);
    assert.ok(unbanned.trustScore >= 70);

    // Admin can assign moderator role
    const newMod = db.assignUserRole(lender.uid, 'moderator', admin);
    assert.equal(newMod.role, 'moderator');
  });
});
