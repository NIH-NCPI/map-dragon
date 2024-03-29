import { useContext } from 'react';
import { Dropdown, Button, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { myContext } from '../../../App';

export const SettingsDropdownTerminology = () => {
  const { clear, setEdit, setClear } = useContext(myContext);

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
    {
      label: 'Delete',
      key: '2',
      danger: true,
    },
  ];

  // onClick for 'Edit' in the dropdown. Sets tableEdit to true to trigger modal to open.
  // The modal has a form to edit the table name, description, and url.
  const onClick = ({ key }) => {
    switch (key) {
      case '0':
        return setEdit(true);
      case '1':
        return setClear(true);
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
