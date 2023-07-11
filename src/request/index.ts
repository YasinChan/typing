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

export const getRegion = () => {
  return axios.get('/api/users/region');
};
