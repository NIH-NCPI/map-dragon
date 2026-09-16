import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useContext, useEffect } from 'react';
import { Logout } from './Logout';
import { myContext } from '../../App';
import { startSession } from '../Manager/SessionsManager';

export const Login = () => {
  const {
    user,
    setUser,
    setUserPic,
    userPic,
    vocabUrl,
    setRole,
    setInstitutionIds
  } = useContext(myContext);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    const storedUserPic = sessionStorage.getItem('userPic');
    if (storedUser) {
      const profile = JSON.parse(storedUser);
      setUser(profile?.email);
      setRole(profile?.role);
      setInstitutionIds(profile?.institutionIds);
    }
    if (storedUserPic) {
      setUserPic(JSON.parse(storedUserPic));
    }
  }, []);

  // If there is a user, it displays the Logout function with user information. Otherwise, it displays the login button
  return user ? (
    <Logout
      user={user}
      setUser={setUser}
      userPic={userPic}
      setUserPic={setUserPic}
    />
  ) : (
    // Logs user in, decodes the JWT token, saves user information in sessionStorage
    <div>
      <GoogleLogin
        theme="filled_black"
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
      />
    </div>
  );
};
