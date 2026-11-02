/**
 * ZarooratSetu - API Service Layer
 * Connects with Node.js backend with mock fallback for 100% offline hackathon demos
 */

const BASE_URL = '/api';

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

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`API call ${endpoint} error:`, err.message);
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
    sendOtp: (phone) => request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    }),
    verifyOtp: (phone, otp) => request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
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
    })
  },

  // Offline / Missed Call
  offline: {
    getQueue: () => request('/offline/pending'),
    volunteerSubmit: (data) => request('/offline/volunteer-submit', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
};
