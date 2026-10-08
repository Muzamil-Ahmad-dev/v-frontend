 import { api } from './client.js';

export const authApi = {
  // ── Registration (3-step OTP flow) ──────────────────────
  // Step 1: send OTP to email
  sendRegistrationOtp: (email) => api.post('/auth/register/send-otp', { email }),
  // Step 2: verify OTP
  verifyRegistrationOtp: (email, otp) => api.post('/auth/register/verify-otp', { email, otp }),
  // Step 3: submit full registration (only after OTP verified)
  register: (body) => api.post('/auth/register', body),

  // ── Auth ────────────────────────────────────────────────
  login: (body) => api.post('/auth/login', body),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),

  // ── Helpers ─────────────────────────────────────────────
  validateReferralCode: (code) => api.get(`/auth/validate-referral/${code}`),
};