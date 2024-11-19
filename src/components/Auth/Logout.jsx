import { googleLogout } from '@react-oauth/google';
import './Auth.scss';
import { LogoutOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

export const Logout = ({ user, setUser }) => {
  const logOut = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <>
      <div className="logged_in_user">
        <div className="user_email">
          <img className="user_image" src={user.picture} />
          {user?.email}
        </div>
        <Tooltip mouseEnterDelay={0.5} placement="bottom" title="Log out">
          <LogoutOutlined
            style={{ fontSize: '18px', color: 'white' }}
            onClick={logOut}
          />
        </Tooltip>
      </div>
    </>
  );
};