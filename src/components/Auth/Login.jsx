import { notification } from 'antd';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useContext, useEffect } from 'react';
import { myContext } from '../../App';
import { startSession } from './SessionsManager';
import { UserMenu } from './UserMenu';
import { readStored } from '../Manager/Utility';

export const Login = () => {
  const { user, setUser, setUserPic, vocabUrl, setRole, setInstitutionIds } =
    useContext(myContext);

  useEffect(() => {
    const profile = readStored('user');
    if (profile) {
      setUser(profile?.email);
      setRole(profile?.role);
      setInstitutionIds(profile?.institutionIds);
    }
    const pic = readStored('userPic');
    if (pic) {
      setUserPic(pic);
    }
  }, []);

  // If there is a user, it displays the Logout function with user information. Otherwise, it displays the login button
  return user ? (
    <UserMenu />
  ) : (
    // Logs user in, decodes the JWT token, saves user information in sessionStorage
    <div>
      <GoogleLogin
        theme="filled_black"
        onSuccess={credentialResponse => {
          const credentialResponseDecoded = jwtDecode(
            credentialResponse.credential
          );

          startSession(vocabUrl, credentialResponse.credential)
            .then(profile => {
              if (!profile || !profile.email) {
                notification.error({
                  message: 'Error',
                  description: `Login failed, ${profile}.`
                });
                return;
              }
              sessionStorage.setItem('user', JSON.stringify(profile));
              if (credentialResponseDecoded.picture) {
                sessionStorage.setItem(
                  'userPic',
                  JSON.stringify(credentialResponseDecoded.picture)
                );
                setUserPic(credentialResponseDecoded.picture);
              }
              setUser(profile.email);
              setRole(profile.role);
              setInstitutionIds(profile.institutionIds);
            })
            .catch(err => {
              notification.error({
                message: 'Error',
                description: err.message ?? 'Login failed.'
              });
            });
        }}
      />
    </div>
  );
};
