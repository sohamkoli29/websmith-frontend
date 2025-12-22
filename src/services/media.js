import { api } from './api';

const mediaService = {
  // Get media list
  getMedia(params) {
    return api.get('/upload/media', { params });
  },

  // Get single media
  getMediaById(id) {
    return api.get(`/upload/media/${id}`);
  },

  // Upload single file
  uploadFile(formData) {
    return api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Upload multiple files
  uploadMultipleFiles(formData) {
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete media
  deleteMedia(id) {
    return api.delete(`/upload/media/${id}`);
  },

  // Delete multiple media
  deleteMultipleMedia(ids) {
    return api.delete('/upload/media', { data: { ids } });
  },

  // Get storage stats
  getStorageStats() {
    return api.get('/upload/stats');
  }
};

export default mediaService;