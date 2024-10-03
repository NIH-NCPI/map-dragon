import { useContext } from 'react';
import { Dropdown, Button, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { myContext } from '../../../App';
import { RequiredLogin } from '../../Auth/RequiredLogin';

export const SettingsDropdownTerminology = ({ codes }) => {
  const { setEdit, setClear, setImportState, user } = useContext(myContext);

  // Login functions for each case in the dropdown menu with different props passed depending on selection

  const passEdit = () => {
    setEdit(true);
  };
  const loginEdit = RequiredLogin({ handleSuccess: passEdit });

  const passClear = () => {
    setClear(true);
  };
  const loginClear = RequiredLogin({ handleSuccess: passClear });

  const passImport = () => {
    setImportState(true);
  };
  const loginImport = RequiredLogin({ handleSuccess: passImport });

  const items = [
    {
      label: 'Edit',
      key: '0',
    },
    {
      label: 'Clear mapped terms',
      key: '1',
      danger: true,
    },
  ];

  if (codes.length < 1) {
    items.unshift({
      label: 'Import CSV',
      key: '2',
    });
  }
  // onClick for dropdown. Sets states to true depending on their key.
  // A modal is then triggered to open in the component to perform the desired task.
  // If a user is not logged in, the login screen is triggered

  const onClick = ({ key }) => {
    switch (key) {
      case '0':
        return user ? setEdit(true) : loginEdit();
      case '1':
        return user ? setClear(true) : loginClear();
      case '2':
        return user ? setImportState(true) : loginImport();
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
