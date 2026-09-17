import { notification } from 'antd';
import { apiFetch } from '../Manager/ApiFetch';

export const startSession = (vocabUrl, token) => {
  const body = {
    'credential': token
  };
  return apiFetch(`${vocabUrl}/auth/google`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => {
    if (res.ok) {
      return res.json();
    } else if (res.status === 403) {
      return res.json().then(error => {
        notification.error({
          message: 'Error',
          description: error.message
        });
      });
    }
  });
};

export const endSession = vocabUrl => {
  return apiFetch(`${vocabUrl}/session/terminate`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(async res => {
    const data = await res.json();
    if (res.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Unknown error occurred');
    }
  });
};

export const getSessionStatus = vocabUrl => {
  return apiFetch(`${vocabUrl}/session/status`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(async res => {
    const data = await res.json();
    if (res.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Unknown error occurred');
    }
  });
};
