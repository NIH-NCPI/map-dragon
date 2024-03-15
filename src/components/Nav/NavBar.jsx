import { Link, NavLink } from 'react-router-dom';
import './NavBar.scss';

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
            {/* <NavLink to="/projects">
              <li className="nav_link" to="/projects">
                Projects
              </li>
            </NavLink> */}
            <NavLink to="/help">
              <li className="nav_link">Help</li>
            </NavLink>

            <NavLink to="/about">
              <li className="nav_link">About</li>
            </NavLink>
          </div>
        </ul>
      </nav>
    </>
  );
};
