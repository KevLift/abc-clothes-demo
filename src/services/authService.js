import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const payload = response.data.data; // Extract from ApiResponse
    return {
      token: payload.accessToken,
      name: `${payload.firstName} ${payload.lastName}`,
      email: payload.email,
      role: payload.role
    };
  },
  
  register: async (name, email, password) => {
    const [firstName, ...lastNameParts] = name.trim().split(' ');
    const lastName = lastNameParts.join(' ') || 'User';
    
    const response = await api.post('/auth/register', { 
      firstName, 
      lastName, 
      email, 
      password 
    });
    const payload = response.data.data; // Extract from ApiResponse
    return {
      token: payload.accessToken,
      name: `${payload.firstName} ${payload.lastName}`,
      email: payload.email,
      role: payload.role
    };
  }
};
