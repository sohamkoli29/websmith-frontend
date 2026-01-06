import { api } from './api';

const contentService = {
  // About
  getAbout() {
    return api.get('/content/about');
  },
  
  updateAbout(data) {
    return api.put('/content/about', data);
  },

  // Skills
  getSkills(params) {
    return api.get('/content/skills', { params });
  },
  
  getSkill(id) {
    return api.get(`/content/skills/${id}`);
  },
  
  createSkill(data) {
    return api.post('/content/skills', data);
  },
  
  updateSkill(id, data) {
    return api.put(`/content/skills/${id}`, data);
  },
  
  deleteSkill(id) {
    return api.delete(`/content/skills/${id}`);
  },

  // Projects
  getProjects(params) {
    return api.get('/content/projects', { params });
  },
  
  getProject(id) {
    return api.get(`/content/projects/${id}`);
  },
  
  createProject(data) {
    return api.post('/content/projects', data);
  },
  
  updateProject(id, data) {
    return api.put(`/content/projects/${id}`, data);
  },
  
  deleteProject(id) {
    return api.delete(`/content/projects/${id}`);
  },

  // Blogs
  getBlogs(params) {
    return api.get('/content/blogs', { params });
  },
  
  getBlog(idOrSlug) {
    return api.get(`/content/blogs/${idOrSlug}`);
  },
  
  createBlog(data) {
    return api.post('/content/blogs', data);
  },
  
  updateBlog(id, data) {
    return api.put(`/content/blogs/${id}`, data);
  },
  
  deleteBlog(id) {
    return api.delete(`/content/blogs/${id}`);
  },

  // Experience
  getExperiences(params) {
    return api.get('/content/experience', { params });
  },
  
  getExperience(id) {
    return api.get(`/content/experience/${id}`);
  },
  
  createExperience(data) {
    return api.post('/content/experience', data);
  },
  
  updateExperience(id, data) {
    return api.put(`/content/experience/${id}`, data);
  },
  
  deleteExperience(id) {
    return api.delete(`/content/experience/${id}`);
  },

  // Testimonials
  getTestimonials(params) {
    return api.get('/content/testimonials', { params });
  },
  
  getTestimonial(id) {
    return api.get(`/content/testimonials/${id}`);
  },
  
  createTestimonial(data) {
    return api.post('/content/testimonials', data);
  },
  
  updateTestimonial(id, data) {
    return api.put(`/content/testimonials/${id}`, data);
  },
  
  deleteTestimonial(id) {
    return api.delete(`/content/testimonials/${id}`);
  },

  // Services
  getServices(params) {
    return api.get('/content/services', { params });
  },
  
  getService(id) {
    return api.get(`/content/services/${id}`);
  },
  
  createService(data) {
    return api.post('/content/services', data);
  },
  
  updateService(id, data) {
    return api.put(`/content/services/${id}`, data);
  },
  
  deleteService(id) {
    return api.delete(`/content/services/${id}`);
  },

  // Messages
  getMessages(params) {
    return api.get('/content/messages', { params });
  },
  
  getMessage(id) {
    return api.get(`/content/messages/${id}`);
  },
  
  updateMessage(id, data) {
    return api.put(`/content/messages/${id}`, data);
  },
  
  deleteMessage(id) {
    return api.delete(`/content/messages/${id}`);
  },

  // Stats
  getStats() {
    return api.get('/content/stats');
  },

  // Contact form (public)
  submitContactForm(data) {
    return api.post('/content/contact', data);
  },

 // Certificates
  getCertificates(params) {
    return api.get('/certificates', { params });
  },
  
  getCertificate(id) {
    return api.get(`/certificates/${id}`);
  },
  
  createCertificate(data) {
    // Transform data to match backend expectations
    const certificateData = {
      title: data.title,
      issuer: data.issuer,
      issue_date: data.issue_date,
      credential_id: data.credential_id,
       // Map from frontend's credential_url to backend's verification_url
      image_url: data.image_url,
      description: data.description,
      featured: data.featured,
      sort_order: data.sort_order || 0
    };
    
    return api.post('/certificates', certificateData);
  },
  
  updateCertificate(id, data) {
    // Transform data to match backend expectations
    const certificateData = {
      title: data.title,
      issuer: data.issuer,
      issue_date: data.issue_date,
      credential_id: data.credential_id,
 // Map from frontend's credential_url to backend's verification_url
      image_url: data.image_url,
      description: data.description,
      featured: data.featured,
      sort_order: data.sort_order || 0
    };
    
    return api.put(`/certificates/${id}`, certificateData);
  },
  
  deleteCertificate(id) {
    return api.delete(`/certificates/${id}`);
  },

  // Achievements
  getAchievements(params) {
    return api.get('/achievements', { params });
  },
  
  getAchievement(id) {
    return api.get(`/achievements/${id}`);
  },
  
  createAchievement(data) {
    return api.post('/achievements', data);
  },
  
  updateAchievement(id, data) {
    return api.put(`/achievements/${id}`, data);
  },
  
  deleteAchievement(id) {
    return api.delete(`/achievements/${id}`);
  },

};

export default contentService;