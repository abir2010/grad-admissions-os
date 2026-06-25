import apiRequest from './client.js';

export const loginUser = (payload) =>
  apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
export const registerUser = (payload) =>
  apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
export const getMe = () => apiRequest('/auth/me');
export const globalSearch = (query) => apiRequest(`/search?q=${encodeURIComponent(query)}`);

export const listUniversities = () => apiRequest('/universities');
export const getUniversity = (id) => apiRequest(`/universities/${id}`);
export const createUniversity = (payload) =>
  apiRequest('/universities', { method: 'POST', body: JSON.stringify(payload) });
export const updateUniversity = (id, payload) =>
  apiRequest(`/universities/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteUniversity = (id) => apiRequest(`/universities/${id}`, { method: 'DELETE' });

export const listProfessors = () => apiRequest('/professors');
export const getProfessor = (id) => apiRequest(`/professors/${id}`);
export const createProfessor = (payload) =>
  apiRequest('/professors', { method: 'POST', body: JSON.stringify(payload) });
export const updateProfessor = (id, payload) =>
  apiRequest(`/professors/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteProfessor = (id) => apiRequest(`/professors/${id}`, { method: 'DELETE' });

export const listDocuments = () => apiRequest('/documents');
export const createDocument = (payload) =>
  apiRequest('/documents', { method: 'POST', body: JSON.stringify(payload) });
export const updateDocument = (id, payload) =>
  apiRequest(`/documents/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteDocument = (id) => apiRequest(`/documents/${id}`, { method: 'DELETE' });

export const listRecommenders = () => apiRequest('/recommenders');
export const createRecommender = (payload) =>
  apiRequest('/recommenders', { method: 'POST', body: JSON.stringify(payload) });
export const updateRecommender = (id, payload) =>
  apiRequest(`/recommenders/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteRecommender = (id) => apiRequest(`/recommenders/${id}`, { method: 'DELETE' });

export const listLorStatuses = () => apiRequest('/lor-statuses');
export const createLorStatus = (payload) =>
  apiRequest('/lor-statuses', { method: 'POST', body: JSON.stringify(payload) });
export const updateLorStatus = (id, payload) =>
  apiRequest(`/lor-statuses/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteLorStatus = (id) => apiRequest(`/lor-statuses/${id}`, { method: 'DELETE' });

export const listSopDrafts = (query = '') => apiRequest(`/sop-drafts${query}`);
export const createSopDraft = (payload) =>
  apiRequest('/sop-drafts', { method: 'POST', body: JSON.stringify(payload) });
export const updateSopDraft = (id, payload) =>
  apiRequest(`/sop-drafts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteSopDraft = (id) => apiRequest(`/sop-drafts/${id}`, { method: 'DELETE' });

export const listEmailDrafts = (query = '') => apiRequest(`/email-drafts${query}`);
export const createEmailDraft = (payload) =>
  apiRequest('/email-drafts', { method: 'POST', body: JSON.stringify(payload) });
export const updateEmailDraft = (id, payload) =>
  apiRequest(`/email-drafts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteEmailDraft = (id) => apiRequest(`/email-drafts/${id}`, { method: 'DELETE' });

export const listCoordinators = (query = '') => apiRequest(`/coordinators${query}`);
export const createCoordinator = (payload) =>
  apiRequest('/coordinators', { method: 'POST', body: JSON.stringify(payload) });
export const updateCoordinator = (id, payload) =>
  apiRequest(`/coordinators/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteCoordinator = (id) => apiRequest(`/coordinators/${id}`, { method: 'DELETE' });

export const listReminders = (query = '') => apiRequest(`/reminders${query}`);
export const createReminder = (payload) =>
  apiRequest('/reminders', { method: 'POST', body: JSON.stringify(payload) });
export const updateReminder = (id, payload) =>
  apiRequest(`/reminders/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteReminder = (id) => apiRequest(`/reminders/${id}`, { method: 'DELETE' });

export const listRequirements = (query = '') => apiRequest(`/requirements${query}`);
export const createRequirement = (payload) =>
  apiRequest('/requirements', { method: 'POST', body: JSON.stringify(payload) });
export const updateRequirement = (id, payload) =>
  apiRequest(`/requirements/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteRequirement = (id) => apiRequest(`/requirements/${id}`, { method: 'DELETE' });
