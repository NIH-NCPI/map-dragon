import { NavLink, useNavigate } from 'react-router-dom';
import './NavBar.scss';
import { Login } from '../Auth/Login';
import { useContext, useState } from 'react';
import { myContext } from '../../App';
import { RequiredLogin } from '../Auth/RequiredLogin';
import Logo from '../../assets/logo.png';

export const NavBar = () => {
  const [routeTo, setRouteTo] = useState(null);
  const { user } = useContext(myContext);
  const navigate = useNavigate();
  const handleSuccess = () => {
    navigate(routeTo);
  };
  const login = RequiredLogin({ handleSuccess: handleSuccess });
  const handleLogin = route => {
    setRouteTo(route);
    login();
  };

  return (
    <>
      <nav className="navbar">
        <ul className="nav_body">
          <div className="logo_container">
            <li className="nav_logo">
              <NavLink className="nav_logo" to="/">
                <img
                  className="logo"
                  alt="Map Dragon logo. Yellow circle with MD in the center."
                  src={Logo}
                />
              </NavLink>
            </li>
          </div>
          <div className="nav_links">
            <NavLink to="/">
              <li className="nav_link">Search</li>
            </NavLink>
            <div
              onClick={() => {
                if (user) {
                  navigate('/studies');
                } else {
                  handleLogin('/studies');
                }
              }}
            >
              <li className="nav_link">Studies</li>
            </div>
            <div
              onClick={() => {
                if (user) {
                  navigate('/terminologies');
                } else {
                  handleLogin('/terminologies');
                }
              }}
            >
              <li className="nav_link">Terminologies</li>
            </div>
            <NavLink to="/about">
              <li className="nav_link">About</li>
            </NavLink>
            <NavLink to="https://nih-ncpi.github.io/map-dragon" target="_blank">
              <li className="nav_link">Help</li>
            </NavLink>

            <NavLink to="/ontologies">
              <li className="nav_link">Ontologies</li>
            </NavLink>
          </div>
          <div className="login">
            <Login />
          </div>
        </ul>
      </nav>
    </>
  );
};
