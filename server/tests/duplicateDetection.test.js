/**
 * Unit Test: Duplicate Detection Engine
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { DuplicateService } from '../services/duplicateService.js';

test('Duplicate Detection Service Verification', async (t) => {
  const existingList = [
    {
      id: "req_test_1",
      userId: "usr_alice",
      category: "Medical",
      title: "Urgent B+ blood donor required at District Hospital Banda",
      description: "Emergency surgery needs 2 units of B positive blood.",
      createdAt: new Date().toISOString()
    },
    {
      id: "req_test_2",
      userId: "usr_bob",
      category: "Items",
      title: "Folding wheelchair for elderly parent",
      description: "Wheelchair needed for two weeks after leg fracture in Civil Lines.",
      createdAt: new Date().toISOString()
    },
    {
      id: "req_test_old",
      userId: "usr_alice",
      category: "Medical",
      title: "Urgent B+ blood donor required at District Hospital Banda",
      description: "Emergency surgery needs 2 units of B positive blood.",
      createdAt: new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString() // 100 hours ago (beyond 72h window)
    }
  ];

  await t.test('Should flag nearly identical text within time window', () => {
    const newReq = {
      id: "req_new_1",
      userId: "usr_charlie",
      category: "Medical",
      title: "Urgent B+ blood donor needed at District Hospital Banda",
      description: "Emergency surgery needs 2 units of B positive blood today."
    };

    const result = DuplicateService.checkDuplicate(newReq, existingList, 72);
    assert.equal(result.isDuplicate, true, "Should be flagged as duplicate");
    assert.equal(result.matchedWithId, "req_test_1");
    assert.ok(result.confidenceScore >= 0.60);
  });

  await t.test('Should NOT flag completely different requests', () => {
    const newReq = {
      id: "req_new_2",
      userId: "usr_david",
      category: "Education",
      title: "UP Scholarship guidance for semester 3",
      description: "Need help filling out the online scholarship application portal."
    };

    const result = DuplicateService.checkDuplicate(newReq, existingList, 72);
    assert.equal(result.isDuplicate, false, "Completely different request should not be flagged");
    assert.equal(result.matchedWithId, null);
  });

  await t.test('Should ignore requests that fall outside the 72-hour window', () => {
    const singleOldList = [existingList[2]]; // only old request
    const newReq = {
      id: "req_new_3",
      userId: "usr_alice",
      category: "Medical",
      title: "Urgent B+ blood donor required at District Hospital Banda",
      description: "Emergency surgery needs 2 units of B positive blood."
    };

    const result = DuplicateService.checkDuplicate(newReq, singleOldList, 72);
    assert.equal(result.isDuplicate, false, "Older than 72 hours should not be flagged as active duplicate");
  });
});
