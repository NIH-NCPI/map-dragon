import { useContext } from 'react';
import { Dropdown, Button, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { myContext } from '../../../App';
import { RequiredLogin } from '../../Auth/RequiredLogin';

export const SettingsDropdownStudy = () => {
  const { setEdit, setDeleteState, user } = useContext(myContext);

  // Login functions for each case in the dropdown menu with different props passed depending on selection
  const passEdit = () => {
    setEdit(true);
  };
  const loginEdit = RequiredLogin({ handleSuccess: passEdit });

  const passDelete = () => {
    setDeleteState(true);
  };
  const loginDelete = RequiredLogin({ handleSuccess: passDelete });

  // placeholder items for the dropdown
  const items = [
    {
      label: 'Edit',
      key: '0',
    },
    // {
    //   label: 'Invite collaborators',
    //   key: '1',
    // },
    {
      label: 'Delete',
      key: '2',
      danger: true,
    },
  ];

  // onClick for dropdown. Sets states to true depending on their key.
  // A modal is then triggered to open in the component to perform the desired task.
  // If a user is not logged in, the login screen is triggered

  const onClick = ({ key }) => {
    switch (key) {
      case '0':
        return user ? setEdit(true) : loginEdit();
      case '2':
        return user ? setDeleteState(true) : loginDelete();
    }
  };
  // Props for dropdown menu.
  const menuProps = {
    items,
    onClick,
  };

  return (
    <Dropdown menu={menuProps} style={{ width: '30vw' }}>
      <Button>
        <Space
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: 100,
          }}
        >
          Settings
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};
