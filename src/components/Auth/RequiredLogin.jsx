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
           onSuccess={credentialResponse => {
                    const credentialResponseDecoded = jwtDecode(
                      credentialResponse.credential
                    );
          
                    startSession(vocabUrl, credentialResponse.credential).then(
                      profile => {
                        sessionStorage.setItem('user', JSON.stringify(profile));
                        sessionStorage.setItem(
                          'userPic',
                          JSON.stringify(credentialResponseDecoded.picture)
                        );
                        setUser(profile.email);
                        setUserPic(credentialResponseDecoded.picture);
                        setRole(profile.role);
                        setInstitutionIds(profile.institutionIds);
                      }
                    );
                  }}
                  onError={() => {
                    console.log('Login Failed');
                  }}
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
