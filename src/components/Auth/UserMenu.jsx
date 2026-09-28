import { Menu } from 'antd';
import { useContext, useState } from 'react';
import { SignedInUi } from './SignedInUI';
import { myContext } from '../../App';
import { Link } from 'react-router-dom';
import { handleLogout } from './Logout';

export const UserMenu = () => {
  const { vocabUrl, role, setUser, setUserPic, setRole, setInstitutionIds } =
    useContext(myContext);

  const items = [
    {
      key: 'main-menu',
      label: <SignedInUi />,
      children: [
        { key: '1', label: <Link to="/user">User Page</Link> },
        { key: '3', label: 'Log Out' }
      ]
    }
  ];

  if (role === 'admin') {
    items[0].children.splice(1, 0, {
      key: '2',
      label: <Link to="/institutions">Institutions</Link>
    });
  }
  const onClick = obj => {
    switch (obj.key) {
      case '3':
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
