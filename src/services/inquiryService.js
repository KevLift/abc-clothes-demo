import api, { unwrap, unwrapPage } from './api';

export const inquiryService = {
  submitContact: async (data) => {
    const response = await api.post('/inquiries/contact', data);
    return unwrap(response.data) || response.data;
  },

  subscribeNewsletter: async (email) => {
    const response = await api.post('/inquiries/newsletter', { email });
    return unwrap(response.data) || response.data;
  },

  list: async (params = {}) => {
    const response = await api.get('/inquiries', { params });
    return unwrapPage(response.data);
  },

  respond: async (id, response) => {
    const res = await api.patch(`/inquiries/${id}/respond`, { response });
    return unwrap(res.data) || res.data;
  },

  /** Admin: queue a free-form email to a single newsletter subscriber. */
  notifySubscriber: async (id, { subject, message }) => {
    const res = await api.post(`/inquiries/${id}/notify`, { subject, message });
    return unwrap(res.data) || res.data;
  },
};
