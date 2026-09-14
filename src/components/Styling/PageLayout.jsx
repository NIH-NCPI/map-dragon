import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const PageLayout = () => {
  const location = useLocation();
  const isLoggedIn = () => {
    const storedUser = localStorage.getItem('user');
    return !!storedUser;
  };
  return isLoggedIn() ? (
    <Outlet />
  ) : (
    <Navigate to={`/login?redirect=${location.pathname}`} />
  );
};
