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
export const getSuggest = (params?: { sort?: 'time' | 'hot' | 'theme' }) => {
  return axios.get('/api/suggest', { params });
};

// 获取某人的建议
export const getSuggestByUserId = (params?: { id: string }) => {
  return axios.get('/api/suggest/by-user-id', { params });
};

// 提出建议
export const createSuggest = (params: {
  content: string;
  userId?: string;
  userName?: string;
  isTheme?: boolean;
  canShow?: boolean;
}) => {
  return axios.post('/api/suggest/create', params);
};

export const voteSuggest = (params: { id: string; value: string }) => {
  return axios.post('/api/suggest/vote', params);
};

// 获取将要做的列表
export const getTodo = () => {
  return axios.get('/api/todo');
};

// 获取排行榜
export const getLeaderBoard = () => {
  return axios.get('/api/leaderboard');
};

// 获取某个用户的记录
export const getLeaderBoardByUserId = (params?: { id: string }) => {
  return axios.get('/api/leaderboard/by-user-id', { params });
};

// 保存记录
export const saveLeaderBoard = (params: any) => {
  return axios.post('/api/leaderboard/save', params);
};

export const getGame = (params?: { id: string }) => {
  return axios.get('/api/game', { params });
};
export const creteGame = (params?: { userName: string; userId?: string; count: number }) => {
  return axios.post('/api/game/create', params);
};

export const getWs = (params?: { id: string }) => {
  return axios.get('/api/ws', { params });
};

export const getWsById = (params?: { id: string }) => {
  return axios.get('/api/ws/by-id', { params });
};
