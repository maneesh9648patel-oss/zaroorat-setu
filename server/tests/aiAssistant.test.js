/**
 * ZarooratSetu - AI Assistant Test Suite
 * Validates conversational triage, category routing, and action links
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { GeminiService } from '../services/geminiService.js';

describe('Setu Sahayak AI Assistant Tests', () => {
  test('Should guide to Medical & Blood for emergency requests', async () => {
    const res = await GeminiService.chatWithAssistant({
      message: "मुझे जिला अस्पताल बांदा में B+ ब्लड चाहिए",
      language: "hi"
    });

    assert.ok(res.reply.length > 20);
    assert.ok(res.reply.includes('अस्पताल') || res.reply.includes('रक्त') || res.reply.includes('Emergency'));
    assert.ok(res.actionLink);
    assert.strictEqual(res.actionLink.path, '/new-request');
  });

  test('Should guide to Study Material for calculator inquiry', async () => {
    const res = await GeminiService.chatWithAssistant({
      message: "Casio scientific calculator chahiye exam ke liye",
      language: "hi"
    });

    assert.ok(res.reply.includes('Casio') || res.reply.includes('कैलकुलेटर') || res.reply.includes('REC Banda'));
    assert.strictEqual(res.actionLink.path, '/borrow-return');
  });

  test('Should guide to Family Utensils for patila / wedding inquiries', async () => {
    const res = await GeminiService.chatWithAssistant({
      message: "50 liter ka patila aur thali bartan chahiye shadi ke liye",
      language: "hi"
    });

    assert.ok(res.reply.includes('पतीला') || res.reply.includes('थाली') || res.reply.includes('बर्तन'));
    assert.strictEqual(res.actionLink.path, '/borrow-return');
  });

  test('Should explain offline toll-free missed call for no internet queries', async () => {
    const res = await GeminiService.chatWithAssistant({
      message: "bina internet phone se kaise madad milegi missed call",
      language: "hi"
    });

    assert.ok(res.reply.includes('1800-ZAROORAT') || res.reply.includes('मिस्ड कॉल'));
    assert.strictEqual(res.actionLink.path, '/volunteer-assist');
  });
});
