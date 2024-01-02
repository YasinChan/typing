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

export const postRegister = (params: { password: string; userName: string; email?: string }) => {
  return axios.post('/api/users/register', params);
};

export const getConfig = () => {
  return axios.get('/api/config');
};

export const getUserInfo = (params: { userId?: string; userName?: string }) => {
  return axios.get('/api/users/info', { params });
};
export const setPersonalInfo = (params: {
  userId: string;
  question?: string;
  answer?: string;
  email?: string;
}) => {
  return axios.post('/api/users/set-personal-info', params);
};

export const updatePassword = (params: { oldPassword: string; newPassword: string }) => {
  return axios.post('/api/users/update-password', params);
};
export const updatePasswordWithAnswer = (params: {
  userName: string;
  answer: string;
  newPassword: string;
}) => {
  return axios.post('/api/users/update-password-with-answer', params);
};

export const postVerifyAnswer = (params: { userName: string; answer: string }) => {
  return axios.post('/api/users/verify-answer', params);
};

// 获取建议
export const getSuggest = (params?: { sort?: 'time' | 'hot' }) => {
  return axios.get('/api/suggest', { params });
};

// 提出建议
export const createSuggest = (params: { content: string; userId?: string; userName?: string }) => {
  return axios.post('/api/suggest/create', params);
};

export const voteSuggest = (params: { id: string; value: string }) => {
  return axios.post('/api/suggest/vote', params);
};

// 获取将要做的列表
export const getTodo = () => {
  return axios.get('/api/todo');
};
