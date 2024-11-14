import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useContext, useEffect } from 'react';
import { Logout } from './Logout';
import { myContext } from '../../App';
import { useLocation, useNavigate } from 'react-router-dom';
export const Login = () => {
  const { user, setUser } = useContext(myContext);
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/'
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  // If there is a user, it displays the Logout function with user information. Otherwise, it displays the login button
  return user ? (
    <Logout user={user} setUser={setUser} />
  ) : (
    // Logs user in, decodes the JWT token, saves the decoded JWT in local storage and sets user to it
    <div>
      <GoogleLogin
        theme="filled_black"
        onSuccess={credentialResponse => {
          localStorage.setItem('googleToken', credentialResponse.access_token); 
          const credentialResponseDecoded = jwtDecode(
            credentialResponse.credential
          );
          setUser(credentialResponseDecoded);
          localStorage.setItem(
            'user',
            JSON.stringify(credentialResponseDecoded)
          );
          navigate(from, { replace: true });
          
        }}
        onError={() => {
          console.log('Login Failed');
        }}
      />
    </div>
  );
};
