/**
 * Unit Test: Database Layer for Item Exchange, Give/Take Transactions and My History
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../config/store.js';
import { exchangeController } from '../controllers/exchangeController.js';

test('Database Layer: Items & Transactions Schema & Atomic Quantity Updates', async (t) => {
  const giverUser = {
    uid: "usr_donor_priya",
    displayName: "Priya Verma",
    phone: "+919839054321",
    aadhaarVerification: { verified: true, last4: "8899" }
  };

  const receiverUser = {
    uid: "usr_aarav",
    displayName: "Aarav Kumar",
    phone: "+919876543210",
    aadhaarVerification: { verified: true, last4: "9842" }
  };

  let testItem;

  await t.test('createItem saves item with quantity_total, quantity_available, owner_id', () => {
    testItem = db.createItem({
      name: "Emergency First Aid Kits",
      category: "Medical",
      quantity_total: 5,
      quantity_available: 5,
      owner_id: giverUser.uid
    });

    assert.ok(testItem.id);
    assert.equal(testItem.name, "Emergency First Aid Kits");
    assert.equal(testItem.quantity_total, 5);
    assert.equal(testItem.quantity_available, 5);
    assert.equal(testItem.owner_id, giverUser.uid);
  });

  await t.test('takeItem atomically decrements available quantity and records transaction with giver and receiver details', () => {
    const result = db.takeItem({
      itemId: testItem.id,
      quantity: 2,
      receiverUser
    });

    assert.equal(result.item.quantity_available, 3, "Available quantity must decrement from 5 to 3");
    assert.ok(result.transaction.id);
    assert.equal(result.transaction.item_id, testItem.id);
    assert.equal(result.transaction.giver_id, giverUser.uid);
    assert.equal(result.transaction.receiver_id, receiverUser.uid);
    assert.equal(result.transaction.quantity, 2);
    assert.equal(result.transaction.type, "take");
    assert.equal(result.transaction.status, "completed");

    // Check saved details of both parties
    assert.equal(result.transaction.giver_name, "Priya Verma");
    assert.equal(result.transaction.giver_phone, "+919839054321");
    assert.equal(result.transaction.receiver_name, "Aarav Kumar");
    assert.equal(result.transaction.receiver_phone, "+919876543210");
  });

  await t.test('takeItem rejects request if quantity requested exceeds available quantity', () => {
    assert.throws(
      () => {
        db.takeItem({
          itemId: testItem.id,
          quantity: 10, // Only 3 left!
          receiverUser
        });
      },
      /Only 3 unit\(s\) available/i
    );
  });

  await t.test('getMyHistory returns items gave and items took for a user', () => {
    const aaravHistory = db.getMyHistory(receiverUser.uid);

    assert.ok(Array.isArray(aaravHistory.took));
    assert.ok(Array.isArray(aaravHistory.gave));
    assert.ok(aaravHistory.totalTook >= 2);
    
    // Check that the transaction took has Priya's details as giver
    const recentTake = aaravHistory.took.find(t => t.item_id === testItem.id);
    assert.ok(recentTake);
    assert.equal(recentTake.giver_name, "Priya Verma");
    assert.equal(recentTake.quantity, 2);
  });
});

test('Exchange Controller: Give Item, Take Item & My History API Permissions', async (t) => {
  const mockRes = () => {
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.jsonData = data; return this; }
    };
    return res;
  };

  const unverifiedUser = {
    uid: "usr_unverified_exchange",
    displayName: "Unverified Person",
    aadhaarVerification: null
  };

  const verifiedUser = {
    uid: "usr_verified_exchange",
    displayName: "Verified Person",
    phone: "+919876000000",
    aadhaarVerification: { verified: true, last4: "7777" }
  };

  await t.test('giveItem blocks unverified user with 403', () => {
    const res = mockRes();
    exchangeController.giveItem({
      user: unverifiedUser,
      body: { name: "Study Notes", category: "Education", quantity: 3 }
    }, res);

    assert.equal(res.statusCode, 403);
    assert.equal(res.jsonData.code, "AADHAAR_VERIFICATION_REQUIRED");
  });

  await t.test('giveItem succeeds for verified user and lists item with quantity', () => {
    const res = mockRes();
    exchangeController.giveItem({
      user: verifiedUser,
      body: { name: "Physics Lab Kit", category: "Education", quantity: 4 }
    }, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonData.success, true);
    assert.equal(res.jsonData.item.quantity_total, 4);
    assert.equal(res.jsonData.item.quantity_available, 4);
  });

  await t.test('takeItem blocks unverified user with 403', () => {
    const res = mockRes();
    exchangeController.takeItem({
      user: unverifiedUser,
      body: { itemId: "itm_study_01", quantity: 1 }
    }, res);

    assert.equal(res.statusCode, 403);
    assert.equal(res.jsonData.code, "AADHAAR_VERIFICATION_REQUIRED");
  });

  await t.test('getMyHistory returns gave and took lists for verified user', () => {
    const res = mockRes();
    exchangeController.getMyHistory({
      user: verifiedUser
    }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.ok(Array.isArray(res.jsonData.gave));
    assert.ok(Array.isArray(res.jsonData.took));
  });
});
