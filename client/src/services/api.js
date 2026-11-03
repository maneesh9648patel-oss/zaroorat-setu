/**
 * ZarooratSetu - API Service Layer
 * Connects with Node.js backend with configurable API_BASE_URL and robust error handling
 */

// Dynamically read from Vite environment variable or fallback to relative '/api'
const envApiUrl = import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL || '/api';
export const API_BASE_URL = envApiUrl.endsWith('/') ? envApiUrl.slice(0, -1) : envApiUrl;

function getAuthHeader() {
  const token = localStorage.getItem('zaroorat_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    let data;
    try {
      data = await res.json();
    } catch (parseErr) {
      data = {};
    }

    if (!res.ok) {
      const serverError = data.error || data.message || `Request failed with status ${res.status}`;
      const err = new Error(serverError);
      err.status = res.status;
      err.code = data.code;
      throw err;
    }

    return data;
  } catch (err) {
    console.warn(`API call ${endpoint} error:`, err.message);

    // Differentiate between network/connectivity failure ("Failed to fetch") vs server response errors
    const isNetworkError = err.name === 'TypeError' && (
      err.message === 'Failed to fetch' ||
      err.message.includes('fetch') ||
      err.message.includes('NetworkError') ||
      err.message.includes('network') ||
      err.message.includes('Failed to load')
    );

    if (isNetworkError) {
      const netErr = new Error("सर्वर से संपर्क नहीं हो पाया (Server se connect nahi ho paya / Cannot reach server). कृपया सुनिश्चित करें कि बैकएंड सर्वर पोर्ट 5000 पर सक्रिय है।");
      netErr.isNetworkError = true;
      throw netErr;
    }

    throw err;
  }
}

export const api = {
  // Auth & KYC
  auth: {
    signup: (data) => request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    login: (data) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    logout: () => request('/auth/logout', {
      method: 'POST'
    }),
    sendOtp: (payload) => request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(typeof payload === 'string' ? { phone: payload } : payload)
    }),
    resendOtp: (payload) => request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(typeof payload === 'string' ? { phone: payload } : payload)
    }),
    verifyOtp: (payload, otpCode) => {
      const body = (typeof payload === 'object' && payload !== null && !otpCode)
        ? payload
        : { phone: payload, otp: otpCode };
      return request('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(body)
      });
    },
    resetPassword: (payload) => request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    verifyEmail: (email) => request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
    updateProfile: (profileData) => request('/auth/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    }),
    uploadIdPlaceholder: (docData) => request('/auth/kyc-tier2-upload', {
      method: 'POST',
      body: JSON.stringify(docData)
    }),
    getMe: () => request('/auth/me'),
    switchDemoUser: (role) => request('/auth/switch-demo-user', {
      method: 'POST',
      body: JSON.stringify({ role })
    })
  },

  // mAadhaar / UIDAI Secure QR Verification
  aadhaar: {
    verifyQr: (qrData) => request('/aadhaar/verify-qr', {
      method: 'POST',
      body: JSON.stringify({ qrData })
    }),
    getStatus: () => request('/aadhaar/status'),
    getSampleQrs: () => request('/aadhaar/sample-qrs')
  },

  // Item Exchange Database Layer (Give, Take, Transactions, Stock & History)
  exchange: {
    giveItem: (data) => request('/exchange/give', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    takeItem: (data) => request('/exchange/take', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    returnItem: (transactionId) => request('/exchange/return', {
      method: 'POST',
      body: JSON.stringify({ transactionId })
    }),
    getHistory: () => request('/exchange/history'),
    getItems: () => request('/exchange/items'),
    getDashboard: () => request('/exchange/dashboard'),
    getRecords: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/exchange/records${query ? `?${query}` : ''}`);
    }
  },

  // Requests
  requests: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/requests${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/requests/${id}`),
    create: (data) => request('/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Human Verifier
  verifier: {
    getQueue: () => request('/verifier/queue'),
    submitAction: (actionData) => request('/verifier/action', {
      method: 'POST',
      body: JSON.stringify(actionData)
    }),
    getAuditLogs: () => request('/verifier/audit')
  },

  // Borrow & Return Handover
  borrow: {
    getItems: () => request('/borrow/items'),
    createItem: (data) => request('/borrow/items', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    generateToken: (tokenData) => request('/borrow/generate-token', {
      method: 'POST',
      body: JSON.stringify(tokenData)
    }),
    confirmHandover: (confirmData) => request('/borrow/confirm-handover', {
      method: 'POST',
      body: JSON.stringify(confirmData)
    }),
    raiseDispute: (disputeData) => request('/borrow/dispute', {
      method: 'POST',
      body: JSON.stringify(disputeData)
    })
  },

  // AI Assistance
  ai: {
    suggestPriority: (data) => request('/ai/priority-score', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    extractVoice: (transcript) => request('/ai/voice-extract', {
      method: 'POST',
      body: JSON.stringify({ transcript })
    }),
    chat: (data) => request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    lensScan: (data) => request('/ai/lens-scan', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Offline / Missed Call
  offline: {
    getQueue: () => request('/offline/pending'),
    volunteerSubmit: (data) => request('/offline/volunteer-submit', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Dispute Resolution & Integrity System
  disputes: {
    saveConditionPhotos: (data) => request('/disputes/condition-photos', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    confirmCondition: (data) => request('/disputes/confirm-condition', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getConditionPhotos: (transactionId) => request(`/disputes/condition-photos/${transactionId}`),
    generateAgreement: (data) => request('/disputes/agreements/generate', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    signAgreement: (agreementId) => request(`/disputes/agreements/${agreementId}/sign`, {
      method: 'POST'
    }),
    getAgreement: (transactionId) => request(`/disputes/agreements/${transactionId}`),
    raiseDispute: (data) => request('/disputes/raise', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    submitResponse: (disputeId, data) => request(`/disputes/${disputeId}/respond`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getDispute: (id) => request(`/disputes/${id}`),
    getMyDisputes: () => request('/disputes/my-disputes'),
    getModeratorQueue: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/disputes/moderator/queue${q ? `?${q}` : ''}`);
    },
    moderatorAction: (disputeId, data) => request(`/disputes/${disputeId}/moderator-action`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    issueDecision: (disputeId, data) => request(`/disputes/${disputeId}/decision`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    submitAppeal: (disputeId, data) => request(`/disputes/${disputeId}/appeal`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    resolveAppeal: (disputeId, data) => request(`/disputes/${disputeId}/appeal-decision`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    assignModeratorRole: (data) => request('/disputes/admin/assign-moderator', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getAdminUsersTrust: () => request('/disputes/admin/users-trust'),
    unrestrictUser: (uid) => request(`/disputes/admin/unrestrict/${uid}`, {
      method: 'POST'
    })
  },

  // AI-Based Smart Matching Engine
  matching: {
    getSmartMatches: (requestId, params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/matching/smart/${requestId}${q ? `?${q}` : ''}`);
    },
    findCustomMatches: (data) => request('/matching/find', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    sendAssistanceRequest: (data) => request('/matching/send-request', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    respondMatch: (data) => request('/matching/respond', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getNotifications: () => request('/matching/notifications'),
    markNotificationRead: (id) => request(`/matching/notifications/${id}/read`, {
      method: 'POST'
    }),
    updateDonorWillingness: (data) => request('/matching/donor/willingness', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getAdminAnalytics: () => request('/matching/admin/analytics')
  }
};
