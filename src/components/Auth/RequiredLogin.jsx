import { useGoogleLogin } from '@react-oauth/google';
import { useContext } from 'react';
import { myContext } from '../../App';
import { apiFetch } from '../Manager/ApiFetch';

export const RequiredLogin = ({ handleSuccess }) => {
  const { user, setUser } = useContext(myContext);
  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      apiFetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenResponse?.access_token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setUser(data);
          sessionStorage.setItem('user', JSON.stringify(data));
          if (handleSuccess) {
            handleSuccess();
          }
        });
    },
    onError: () => {
      console.log('Login Failed');
    }
  });

  return login;
};
