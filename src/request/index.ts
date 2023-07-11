import axios from 'axios';

export const getMe = () => {
  return axios.get('/api/users/me');
};

export const postLogin = (params: { userName: string; password: string }) => {
  return axios.post('/api/users/login', params);
};

export const postLogout = () => {
  return axios.post('/api/users/logout');
};

export const postRegister = (params: { userName: string; password: string }) => {
  return axios.post('/api/users/register', params);
};

export const getConfig = () => {
  return axios.get('/api/config');
};

export const getUserInfo = (params: { userId: string }) => {
  return axios.get('/api/users/info', { params });
};
