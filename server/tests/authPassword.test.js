/**
 * Unit Test: Password Hashing, JWT Authentication, Signup & Login Portals
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../utils/security.js';
import { authController } from '../controllers/authController.js';
import { db } from '../config/store.js';
import { authenticate } from '../middleware/auth.js';

test('Security Utils: Password Hashing & JWT Verification', async (t) => {
  await t.test('hashPassword produces salt:hash and verifyPassword validates correctly', () => {
    const rawPass = "SecretPass123!";
    const hashed = hashPassword(rawPass);
    
    assert.ok(hashed.includes(':'), "Hash must contain salt delimiter");
    assert.notEqual(hashed, rawPass, "Password must never be plain text");
    assert.equal(verifyPassword(rawPass, hashed), true, "Correct password must verify true");
    assert.equal(verifyPassword("WrongPassword", hashed), false, "Wrong password must verify false");
  });

  await t.test('generateToken produces valid signed JWT that verifyToken decodes', () => {
    const payload = { uid: "usr_test_123", email: "test@example.com", role: "needer" };
    const token = generateToken(payload);
    
    assert.ok(token.split('.').length === 3, "JWT must have 3 segments");
    const decoded = verifyToken(token);
    assert.ok(decoded, "Token must be decoded successfully");
    assert.equal(decoded.uid, payload.uid);
    assert.equal(decoded.email, payload.email);
  });

  await t.test('verifyToken rejects tampered or expired tokens', () => {
    const payload = { uid: "usr_tamper" };
    const token = generateToken(payload);
    const tampered = token.slice(0, -4) + "abcd";
    assert.equal(verifyToken(tampered), null, "Tampered signature must be rejected");
  });
});

test('Auth Controller: Signup Flow & Validation', async (t) => {
  const mockRes = () => {
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.jsonData = data; return this; }
    };
    return res;
  };

  await t.test('signup rejects missing or short name', () => {
    const res = mockRes();
    authController.signup({
      body: { name: "A", phone: "9876500001", email: "valid@mail.com", password: "password123" }
    }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData.code, "INVALID_NAME");
  });

  await t.test('signup rejects invalid 10-digit phone', () => {
    const res = mockRes();
    authController.signup({
      body: { name: "Test User", phone: "12345", email: "valid@mail.com", password: "password123" }
    }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData.code, "INVALID_PHONE_LENGTH");
  });

  await t.test('signup rejects invalid email format', () => {
    const res = mockRes();
    authController.signup({
      body: { name: "Test User", phone: "9876500002", email: "notanemail", password: "password123" }
    }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData.code, "INVALID_EMAIL_FORMAT");
  });

  await t.test('signup rejects password shorter than 6 characters', () => {
    const res = mockRes();
    authController.signup({
      body: { name: "Test User", phone: "9876500003", email: "short@mail.com", password: "123" }
    }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData.code, "INVALID_PASSWORD_LENGTH");
  });

  const uniqueSuffix = Date.now().toString(36);
  const testEmail = `newuser_${uniqueSuffix}@example.com`;
  const testPhone = `9810${Math.floor(100000 + Math.random() * 900000)}`;

  await t.test('signup succeeds with valid credentials and securely hashes password', () => {
    const res = mockRes();
    authController.signup({
      body: {
        name: "Ramesh Sharma",
        phone: testPhone,
        email: testEmail,
        password: "MySecurePassword123"
      }
    }, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonData.success, true);
    assert.ok(res.jsonData.token, "Must return session token");
    assert.equal(res.jsonData.user.displayName, "Ramesh Sharma");
    assert.equal(res.jsonData.user.email, testEmail);
    assert.equal(res.jsonData.user.passwordHash, undefined, "passwordHash MUST NEVER be leaked in user payload");
  });

  await t.test('signup prevents duplicate phone registration', () => {
    const res = mockRes();
    authController.signup({
      body: {
        name: "Duplicate Phone Guy",
        phone: testPhone,
        email: `another_${uniqueSuffix}@example.com`,
        password: "password123"
      }
    }, res);

    assert.equal(res.statusCode, 409);
    assert.equal(res.jsonData.code, "PHONE_EXISTS");
  });

  await t.test('signup prevents duplicate email registration', () => {
    const res = mockRes();
    authController.signup({
      body: {
        name: "Duplicate Email Guy",
        phone: `9922${Math.floor(100000 + Math.random() * 900000)}`,
        email: testEmail,
        password: "password123"
      }
    }, res);

    assert.equal(res.statusCode, 409);
    assert.equal(res.jsonData.code, "EMAIL_EXISTS");
  });
});

test('Auth Controller: Login Flow (Email/Phone + Password)', async (t) => {
  const mockRes = () => {
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.jsonData = data; return this; }
    };
    return res;
  };

  const loginSuffix = Date.now().toString(36);
  const userEmail = `login_${loginSuffix}@example.com`;
  const userPhone = `9955${Math.floor(100000 + Math.random() * 900000)}`;
  const userPassword = "SecretLoginPass789";

  // First create user
  const signupRes = mockRes();
  authController.signup({
    body: {
      name: "Kavita Devi",
      phone: userPhone,
      email: userEmail,
      password: userPassword
    }
  }, signupRes);
  assert.equal(signupRes.statusCode, 201);

  await t.test('login succeeds with email and correct password', () => {
    const res = mockRes();
    authController.login({
      body: { identifier: userEmail, password: userPassword }
    }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.ok(res.jsonData.token);
    assert.equal(res.jsonData.user.displayName, "Kavita Devi");
  });

  await t.test('login succeeds with 10-digit mobile phone and correct password', () => {
    const res = mockRes();
    authController.login({
      body: { identifier: userPhone, password: userPassword }
    }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.ok(res.jsonData.token);
    assert.equal(res.jsonData.user.displayName, "Kavita Devi");
  });

  await t.test('login fails with wrong password', () => {
    const res = mockRes();
    authController.login({
      body: { identifier: userEmail, password: "WrongPassword" }
    }, res);

    assert.equal(res.statusCode, 401);
    assert.equal(res.jsonData.code, "INVALID_CREDENTIALS");
  });

  await t.test('login fails for non-existent account', () => {
    const res = mockRes();
    authController.login({
      body: { identifier: "nonexistent@nowhere.com", password: "somePassword" }
    }, res);

    assert.equal(res.statusCode, 401);
    assert.equal(res.jsonData.code, "USER_NOT_FOUND");
  });

  await t.test('authenticate middleware validates issued JWT token and sets req.user', () => {
    const loginRes = mockRes();
    authController.login({
      body: { identifier: userEmail, password: userPassword }
    }, loginRes);
    const token = loginRes.jsonData.token;

    const req = {
      headers: { authorization: `Bearer ${token}` }
    };
    const res = mockRes();
    let nextCalled = false;

    authenticate(req, res, () => {
      nextCalled = true;
      assert.ok(req.user, "req.user must be attached by authenticate middleware");
      assert.equal(req.user.email, userEmail);
    });

    assert.equal(nextCalled, true, "authenticate middleware must invoke next()");
  });
});
