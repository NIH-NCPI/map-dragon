/*Wrapper for fetch calls to handle:
401 errors: remove user information if session has expired
403 errors: show an error message if user is not authorized
*/
import { notification } from 'antd';

export const apiFetch = (url, options = {}, navigate) => {
  return fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }).then(res => {
    if (res.status === 401) {
      sessionStorage.removeItem('userProfile');
      sessionStorage.removeItem('userPic');
      navigate('/login');
      throw new Error('Session expired');
    }
    if (res.status === 403) {
      return res.json().then(error => {
        notification.error({
          message: 'Error',
          description: error.message
        });
      });
    }
    return res;
  });
};
