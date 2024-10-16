import { NavLink } from 'react-router-dom';
import './NavBar.scss';
import { Login } from '../Auth/Login';
import { GoogleOAuthProvider } from '@react-oauth/google';

export const NavBar = () => {
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
            <NavLink to="/studies">
              <li className="nav_link">Studies</li>
            </NavLink>
            <NavLink to="/terminologies">
              <li className="nav_link">Terminologies</li>
            </NavLink>
            {/* Placeholder elements below. No functionality at this time.*/}
            <NavLink to="/help">
              <li className="nav_link">About</li>
            </NavLink>

            <NavLink to="/about">
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
