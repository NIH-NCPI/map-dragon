import { useGoogleLogin } from '@react-oauth/google';
import { useContext } from 'react';
import { myContext } from '../../App';

export const RequiredLogin = ({ handleSuccess }) => {
  const { setUser } = useContext(myContext);
  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenResponse?.access_token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
          if (handleSuccess) {
            handleSuccess();
          }
        });
    },
    onError: () => {
      console.log('Login Failed');
    },
  });

  return login;
};
