/**
 * ZarooratSetu - Real SMS Provider & WebOTP Abstraction Service
 * Supports:
 * 1. Fast2SMS (India Instant SMS API, routes: 'otp' and 'q' Quick SMS)
 * 2. MSG91 (India Telecom DLT Approved OTP API)
 * 3. Twilio (International / Global GSM SMS)
 * 4. WebOTP SMS Formatting (@domain #OTP) for Native SIM-Device Auto-fill
 * 5. Development Console Simulator (active when no keys configured)
 */

import dotenv from 'dotenv';
dotenv.config();

export class SmsService {
  /**
   * Dispatch OTP SMS to mobile device
   * @param {Object} params
   * @param {string} params.phone - Normalized E.164 phone (+91XXXXXXXXXX)
   * @param {string} params.otp - 6-digit numeric OTP code
   * @param {string} [params.originDomain] - Request host/domain for WebOTP auto-fill
   * @returns {Promise<{ success: boolean, provider: string, realSmsSent: boolean, message?: string }>}
   */
  static async sendOtpSms({ phone, otp, originDomain = '' }) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const provider = (process.env.SMS_PROVIDER || '').toLowerCase();

    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    const msg91Key = process.env.MSG91_AUTH_KEY;
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    // WebOTP Standard format:
    // Line 1: User message with OTP
    // Line 2: Empty line
    // Line 3: @<domain> #<OTP> (Allows SIM-carrying Android/iOS devices to auto-read)
    const cleanHost = originDomain ? originDomain.replace(/https?:\/\//, '').split(':')[0] : '';
    const webOtpTag = cleanHost ? `\n\n@${cleanHost} #${otp}` : '';
    const fullMessage = `Your ZarooratSetu OTP is ${otp}. Valid for 5 minutes. Do not share it with anyone.${webOtpTag}`;

    const hasLiveKeys = Boolean(fast2smsKey || msg91Key || (twilioSid && twilioToken));

    // 1. FAST2SMS PROVIDER (Direct real SMS to Indian mobile numbers)
    if (fast2smsKey || provider === 'fast2sms') {
      try {
        console.log(`📡 [SMS GATEWAY] Dispatching REAL SMS via Fast2SMS to +91 ${cleanPhone}...`);
        
        // Try Fast2SMS BulkV2 API with OTP route or Quick SMS route
        const route = process.env.FAST2SMS_ROUTE || 'otp';
        const requestPayload = route === 'otp' 
          ? {
              route: 'otp',
              variables_values: otp,
              numbers: cleanPhone
            }
          : {
              route: 'q',
              message: fullMessage,
              numbers: cleanPhone,
              language: 'english'
            };

        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': fast2smsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestPayload)
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.return === true) {
          console.log(`✅ [SMS GATEWAY] Real SMS successfully delivered via Fast2SMS to +91 ${cleanPhone}! ReqId: ${data.request_id || 'OK'}`);
          return {
            success: true,
            provider: 'fast2sms',
            realSmsSent: true,
            requestId: data.request_id,
            message: `Real SMS delivered to +91 ${cleanPhone} via Fast2SMS`
          };
        }

        console.warn(`⚠️ [SMS GATEWAY] Fast2SMS API response warning:`, data.message || data);
      } catch (err) {
        console.error("❌ [SMS GATEWAY] Fast2SMS dispatch error:", err.message);
      }
    }

    // 2. MSG91 PROVIDER (DLT Registered India Enterprise Gateway)
    if (msg91Key || provider === 'msg91') {
      try {
        console.log(`📡 [SMS GATEWAY] Dispatching REAL SMS via MSG91 to +91 ${cleanPhone}...`);
        const templateId = process.env.MSG91_TEMPLATE_ID || 'default_otp_template';
        const url = `https://control.msg91.com/api/v5/otp?template_id=${encodeURIComponent(templateId)}&mobile=91${cleanPhone}&authkey=${encodeURIComponent(msg91Key)}&otp=${encodeURIComponent(otp)}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok && data.type !== 'error') {
          console.log(`✅ [SMS GATEWAY] Real SMS successfully delivered via MSG91 to +91 ${cleanPhone}!`);
          return {
            success: true,
            provider: 'msg91',
            realSmsSent: true,
            data
          };
        }
        console.warn("⚠️ [SMS GATEWAY] MSG91 response warning:", data);
      } catch (err) {
        console.error("❌ [SMS GATEWAY] MSG91 dispatch error:", err.message);
      }
    }

    // 3. TWILIO PROVIDER (Global Cellular Carrier Dispatch)
    if ((twilioSid && twilioToken && twilioPhone) || provider === 'twilio') {
      try {
        console.log(`📡 [SMS GATEWAY] Dispatching REAL SMS via Twilio to +91 ${cleanPhone}...`);
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');

        const params = new URLSearchParams();
        params.append('To', `+91${cleanPhone}`);
        params.append('From', twilioPhone);
        params.append('Body', fullMessage);

        const response = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok && data.sid) {
          console.log(`✅ [SMS GATEWAY] Real SMS successfully delivered via Twilio to +91 ${cleanPhone}! SID: ${data.sid}`);
          return {
            success: true,
            provider: 'twilio',
            realSmsSent: true,
            messageSid: data.sid
          };
        }
        console.warn("⚠️ [SMS GATEWAY] Twilio response warning:", data.message || data);
      } catch (err) {
        console.error("❌ [SMS GATEWAY] Twilio dispatch error:", err.message);
      }
    }

    // 4. DEVELOPMENT CONSOLE SIMULATOR (Active when no live SMS gateway keys are set in .env)
    console.log(`\n=============================================================`);
    console.log(`📨 [ZAROORATSETU SMS GATEWAY] SIMULATED OTP DISPATCH`);
    console.log(`📱 Recipient (SIM): +91 ${cleanPhone}`);
    console.log(`🔑 6-Digit OTP:    ${otp}`);
    console.log(`⏳ Expiry:         5 Minutes`);
    console.log(`🌐 WebOTP Domain:  ${cleanHost || 'localhost'}`);
    console.log(`💬 Carrier SMS:    "${fullMessage.replace(/\n/g, ' ')}"`);
    if (!hasLiveKeys) {
      console.log(`💡 [TIP FOR REAL SMS ON PHONE]:`);
      console.log(`   Apne server/.env me FAST2SMS_API_KEY ya MSG91_AUTH_KEY daalein`);
      console.log(`   taaki SIM wale mobile phone par real SMS deliver ho sake.`);
    }
    console.log(`=============================================================\n`);

    return {
      success: true,
      provider: 'console',
      simulated: true,
      realSmsSent: false,
      message: `OTP logged to console. Add FAST2SMS_API_KEY in server/.env for real cellular SMS.`
    };
  }
}
