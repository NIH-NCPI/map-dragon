import { Navigate, useLocation } from 'react-router-dom';
import { Login } from './Login';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../App';
export const LoginPage = () => {
  const location = useLocation();
  const { user } = useContext(myContext);
  const [redirect, setRedirect] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setRedirect(params.get('redirect'));
  }, [location.search]);
  return (
    <div style={{ background: 'rgba(0,0,0,.2' }}>
      {user && <Navigate to={redirect} />}
      <div
        style={{
          height: '5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <Login />
      </div>
    </div>
  );
};
