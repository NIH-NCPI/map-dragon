import { useContext } from 'react';
import './Auth.scss';
import { myContext } from '../../App';

export const SignedInUi = () => {
  const { user, userPic } = useContext(myContext);
  return (
    <>
      <div className="logged_in_user">
        <div className="user_email">
          <img className="user_image" src={userPic} />
          {String(user)}
        </div>
      </div>
    </>
  );
};
