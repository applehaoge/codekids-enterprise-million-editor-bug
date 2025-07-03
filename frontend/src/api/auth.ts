import apiClient from './index';

interface LoginParams {
  username: string;
  password: string;
}

interface RegisterParams extends LoginParams {
  email: string;
}

export const authAPI = {
  login: (data: LoginParams) => apiClient.post('/auth/login', data),
  register: (data: RegisterParams) => apiClient.post('/auth/register', data),
  logout: () => apiClient.post('/auth/logout'),
  getProfile: () => apiClient.get('/auth/profile'),
};
