import { googleLogout } from '@react-oauth/google';
import './Auth.scss';
import { LogoutOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { endSession } from '../Manager/SessionsManager';
import { useContext } from 'react';
import { myContext } from '../../App';

export const Logout = ({ user, setUser,userPic,setUserPic }) => {
  const { vocabUrl } = useContext(myContext)

  const logOut = () => {

    googleLogout();
    endSession(vocabUrl);
    setUser(null);
    setUserPic(null);
    localStorage.removeItem('user');
  };

  return (
    <>
      <div className="logged_in_user">
        <div className="user_email">
          <img className="user_image" src={userPic} />
          {String(user)}
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
