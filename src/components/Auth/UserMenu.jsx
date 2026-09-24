import { Menu } from 'antd';
import { useContext, useState } from 'react';
import { SignedInUi } from './SignedInUI';
import { myContext } from '../../App';
import { Link } from 'react-router-dom';
import { handleLogout } from './Logout';

export const UserMenu = () => {
  const { vocabUrl, user, setUser, setUserPic, setRole, setInstitutionIds } =
    useContext(myContext);

  const items = [
    {
      key: 'main-menu',
      label: <SignedInUi />,
      children: [
        { key: '1', label: <Link to="/user">User Page</Link> },
        { key: '2', label: 'Log Out' }
      ]
    }
  ];

  const onClick = obj => {
    switch (obj.key) {
      case '2':
        handleLogout(vocabUrl, setUser, setUserPic, setRole, setInstitutionIds);
        break;
      default:
        break;
    }
  };

  return (
    <div className="user_menu">
      <Menu
        items={items}
        onClick={onClick}
        mode="horizontal"
        triggerSubMenuAction="click"
        selectable={false}
        style={{ background: 'none', border: 'none' }}
        disabledOverflow
      />
    </div>
  );
};
