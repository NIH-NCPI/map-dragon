import { useContext } from 'react';
import './Auth.scss';
import { myContext } from '../../App';
import { DownOutlined } from '@ant-design/icons';

export const SignedInUi = () => {
  const { user, userPic } = useContext(myContext);
  return (
    <>
      <div className="logged_in_user">
        <div className="user_email">
          <img className="user_image" src={userPic} />
          {String(user)}
          <DownOutlined />
        </div>
      </div>
    </>
  );
};
