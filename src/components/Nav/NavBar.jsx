import { NavLink, useNavigate } from 'react-router-dom';
import './NavBar.scss';
import { Login } from '../Auth/Login';
import { useContext, useState } from 'react'
import { myContext } from '../../App';
import { RequiredLogin } from '../Auth/RequiredLogin';

export const NavBar = () => {
  const [routeTo, setRouteTo] = useState(null);
  const { user } = useContext(myContext);
  const navigate = useNavigate();
  const handleSuccess = () => {
    navigate(routeTo);
  };
  const login = RequiredLogin({ handleSuccess: handleSuccess });
  const handleLogin = (route) => {
    setRouteTo(route);
    login();
  }
  
  return (
    <>
      <nav className="navbar">
        <ul className="nav_body">
          <div className="logo_container">
            <li className="nav_logo">
              <NavLink className="nav_logo" to="/">
                FREE THE DATA
              </NavLink>
            </li>
          </div>
          <div className="nav_links">
            <NavLink to="/">
              <li className="nav_link">Search</li>
            </NavLink>
            <div onClick={() => {
              if (user) {
                navigate('/studies')
              } else {
                handleLogin('/studies')
              }
            }}>
              <li className="nav_link">Studies</li>
            </div>
            <div onClick={() => {
              if (user) {
                navigate('/terminologies')
              } else {
                handleLogin('/terminologies')
              }
            }}>
              <li className="nav_link">Terminologies</li>
            </div>
            {/* Placeholder elements below. No functionality at this time.*/}
            <NavLink to="/about">
              <li className="nav_link">About</li>
            </NavLink>

            <NavLink to="/ontologies">
              <li className="nav_link">Ontologies</li>
            </NavLink>
          </div>
          <div className="login">
            <Login />
          </div>
        </ul>
      </nav >
    </>
  );
};
