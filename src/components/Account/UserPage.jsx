import { Descriptions } from 'antd';
import { useContext, useEffect } from 'react';
import { myContext } from '../../App';
import './UserPage.scss';

export const UserPage = () => {
  const { user, role, institutionIds } = useContext(myContext);

  useEffect(() => {
    document.title = 'User Page - MapDragon';
  }, []);
  const items = [
    { key: '1', label: 'Email', children: user },
    { key: '2', label: 'Role', children: role },
    {
      key: '3',
      label: 'Institution(s)',
      children: (
        <div className="institution-wrapper">
          {institutionIds.map(id => {
            return (
              <>
                <div>{id}</div>
              </>
            );
          })}
        </div>
      )
    }
  ];

  return (
    <div className="user-page-container">
      <h2>User Page</h2>

      <Descriptions
        className="descriptions-wrapper"
        title="User Info"
        labelStyle={{ width: 130, backgroundColor: 'rgb(189, 189, 187, 0.1)' }}
        contentStyle={{
          backgroundColor: 'rgb(189, 189, 187, 0.1)',
          textWrap: 'wrap'
        }}
        column={1}
        bordered
        items={items}
        size="small"
      />
    </div>
  );
};
