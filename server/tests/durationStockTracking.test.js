import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { db } from '../config/store.js';

describe('Item Duration & Stock Tracking System', () => {
  let giverUser;
  let receiverUser;
  let unauthorizedUser;
  let testItem;

  beforeEach(() => {
    // Setup clean test users
    giverUser = db.createUser({
      uid: `usr_giver_${Date.now()}`,
      displayName: "Amit Verma",
      phone: "+919876500001",
      email: `amit_${Date.now()}@example.com`,
      role: "lender",
      aadhaarVerification: {
        verified: true,
        name: "Amit Verma",
        last4: "4321",
        dob: "12-05-1991",
        gender: "M"
      }
    });

    receiverUser = db.createUser({
      uid: `usr_rcv_${Date.now()}`,
      displayName: "Sneha Patel",
      phone: "+919876500002",
      email: `sneha_${Date.now()}@example.com`,
      role: "needer",
      aadhaarVerification: {
        verified: true,
        name: "Sneha Patel",
        last4: "8765",
        dob: "25-08-1996",
        gender: "F"
      }
    });

    unauthorizedUser = db.createUser({
      uid: `usr_unauth_${Date.now()}`,
      displayName: "Stranger User",
      phone: "+919876500003",
      email: `stranger_${Date.now()}@example.com`,
      role: "needer",
      aadhaarVerification: {
        verified: true,
        name: "Stranger User",
        last4: "1111",
        dob: "01-01-1990",
        gender: "M"
      }
    });

    // Create an item with quantity_total: 5
    testItem = db.createItem({
      name: "Stethoscope & BP Apparatus Kit",
      category: "Medical & Mobility",
      quantity_total: 5,
      quantity_available: 5,
      owner_id: giverUser.uid,
      loanPeriodDays: 14,
      estimatedPrice: 3000
    });
  });

  test('Auto-calculates issue_date, duration_days, and due_date on take', () => {
    const beforeTime = Date.now();
    const result = db.takeItem({
      itemId: testItem.id,
      quantity: 2,
      duration_days: 10,
      receiverUser
    });

    const txn = result.transaction;
    assert.strictEqual(txn.quantity, 2);
    assert.strictEqual(txn.duration_days, 10);
    assert.ok(txn.issue_date, 'issue_date must be present');
    assert.ok(txn.due_date, 'due_date must be present');
    assert.strictEqual(txn.return_date, null);

    // Verify due_date is approximately issue_date + 10 days
    const issueTime = new Date(txn.issue_date).getTime();
    const dueTime = new Date(txn.due_date).getTime();
    const diffDays = Math.round((dueTime - issueTime) / (1000 * 60 * 60 * 24));
    assert.strictEqual(diffDays, 10, 'Due date must be exactly 10 days after issue date');
  });

  test('Auto-updates stock: decreases on take, blocks taking more than available', () => {
    // Initial stock is 5
    assert.strictEqual(testItem.quantity_available, 5);

    // Take 3 units
    const res1 = db.takeItem({
      itemId: testItem.id,
      quantity: 3,
      receiverUser
    });
    assert.strictEqual(res1.item.quantity_available, 2, 'Available quantity should decrease to 2');

    // Attempt to take 3 units when only 2 are available -> MUST BE BLOCKED
    assert.throws(() => {
      db.takeItem({
        itemId: testItem.id,
        quantity: 3,
        receiverUser
      });
    }, /Only 2 unit\(s\) available/, 'Should block taking more than what is available');

    // Take remaining 2 units
    const res2 = db.takeItem({
      itemId: testItem.id,
      quantity: 2,
      receiverUser
    });
    assert.strictEqual(res2.item.quantity_available, 0, 'Available quantity should decrease to 0');
    assert.strictEqual(res2.item.status, 'borrowed', 'Item status becomes borrowed when out of stock');
  });

  test('Mark as returned: increases stock and sets return_date and returned status', () => {
    // Take 2 units
    const takeResult = db.takeItem({
      itemId: testItem.id,
      quantity: 2,
      duration_days: 7,
      receiverUser
    });
    assert.strictEqual(takeResult.item.quantity_available, 3);
    const txnId = takeResult.transaction.id;

    // Giver marks item as returned
    const returnResult = db.returnItem({
      transactionId: txnId,
      returningUser: giverUser
    });

    assert.strictEqual(returnResult.transaction.status, 'returned');
    assert.ok(returnResult.transaction.return_date, 'return_date should be recorded');
    assert.strictEqual(returnResult.item.quantity_available, 5, 'Stock should be restored from 3 to 5');
    assert.strictEqual(returnResult.item.status, 'available');

    // Repeating return on already returned item should throw
    assert.throws(() => {
      db.returnItem({
        transactionId: txnId,
        returningUser: giverUser
      });
    }, /already marked as returned/);
  });

  test('Unauthorized user is blocked from marking transaction as returned', () => {
    const takeResult = db.takeItem({
      itemId: testItem.id,
      quantity: 1,
      receiverUser
    });

    // An unrelated stranger tries to mark it returned
    assert.throws(() => {
      db.returnItem({
        transactionId: takeResult.transaction.id,
        returningUser: unauthorizedUser
      });
    }, /Unauthorized/);
  });

  test('Identifies overdue items when due_date has passed', () => {
    // Create an artificial past transaction that was due 5 days ago
    const pastIssue = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
    const pastDue = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

    const pastTxn = db.createTransaction({
      item_id: testItem.id,
      giver_id: giverUser.uid,
      receiver_id: receiverUser.uid,
      quantity: 1,
      type: "take",
      status: "active",
      issue_date: pastIssue,
      duration_days: 10,
      due_date: pastDue,
      return_date: null,
      item_name: testItem.name,
      giver_name: giverUser.displayName,
      receiver_name: receiverUser.displayName
    });

    const enriched = db.enrichTransaction(pastTxn);
    assert.strictEqual(enriched.is_overdue, true, 'Transaction with past due_date must be is_overdue=true');
    assert.strictEqual(enriched.status, 'overdue');
    assert.ok(enriched.days_overdue >= 4, 'days_overdue must reflect past days');
  });

  test('getStockSummary provides stock totals, currently given out items and overdue items', () => {
    // Create active transaction
    db.takeItem({
      itemId: testItem.id,
      quantity: 2,
      duration_days: 14,
      receiverUser
    });

    const summary = db.getStockSummary();
    assert.ok(summary.summary, 'Summary object exists');
    assert.ok(summary.summary.totalStock > 0);
    assert.ok(summary.summary.availableStock >= 0);
    assert.ok(summary.currentlyGivenOut.length >= 1, 'Currently given out list contains active items');
    assert.ok(Array.isArray(summary.overdueItems));
  });

  test('getAllExchangeRecords filters by status and supports search', () => {
    const records = db.getAllExchangeRecords({
      search: "Stethoscope"
    });
    assert.ok(records.length >= 1);
    assert.ok(records.every(r => r.item_name.includes("Stethoscope")));
  });
});
