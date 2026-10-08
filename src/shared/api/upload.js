import { api } from './client.js';

// File Upload Service (Cloudinary)

export const uploadApi = {
  // ── Image Upload ────────────────────────────────────────
  uploadImage: (formData) => api.upload('/upload/image', formData, 'POST'),

  // ── Image Delete ────────────────────────────────────────
  deleteImage: (publicId) => api.post('/upload/delete', { publicId }),

  // ── Multiple Images Upload ──────────────────────────────
  uploadMultiple: (formDataArray) =>
    Promise.all(formDataArray.map((fd) => api.upload('/upload/image', fd, 'POST'))),
};
