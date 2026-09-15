import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { myContext } from '../../App';

export const PageLayout = () => {
  const location = useLocation();
  const { user } = useContext(myContext);

  const isLoggedIn = () => !!user;
  return isLoggedIn() ? (
    <Outlet />
  ) : (
    <Navigate to={`/login?redirect=${location.pathname}`} />
  );
};
