import { NavLink } from 'react-router-dom';
import './NavBar.scss';
import { Login } from '../Auth/Login';
import { useContext } from 'react';
import { myContext } from '../../App';
import Logo from '../../assets/logo.png';

export const NavBar = () => {
  const { user } = useContext(myContext);
  return (
    <>
      <nav className="navbar">
        <ul className="nav_body">
          <div className="logo_container">
            <li className="nav_logo">
              <NavLink className="nav_logo" to="/">
                <img
                  className="logo"
                  alt="MapDragon logo. Yellow circle with MD in the center."
                  src={Logo}
                />
              </NavLink>
            </li>
          </div>
          <div className="nav_links">
            <NavLink to="/studies">
              <li className="nav_link">Studies</li>
            </NavLink>
            <span className="nav_separator"></span>

            <NavLink to="/terminologies">
              <li className="nav_link">Terminologies</li>
            </NavLink>
            <span className="nav_separator"></span>

            <NavLink to="/ontologies">
              <li className="nav_link">Ontologies</li>
            </NavLink>
            <span className="nav_separator"></span>

            <NavLink to="https://nih-ncpi.github.io/map-dragon" target="_blank">
              <li className="nav_link">Help</li>
            </NavLink>
            <span className="nav_separator"></span>

            <NavLink to="/about">
              <li className="nav_link">About</li>
            </NavLink>
            <span className="nav_separator"></span>

            <NavLink to="/">
              <li className="nav_link last_nav_link">Search</li>
            </NavLink>
          </div>
          <div className="login">{user && <Login />}</div>
        </ul>
      </nav>
    </>
  );
};
