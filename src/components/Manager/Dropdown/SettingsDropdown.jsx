import { useContext } from 'react';
import { Dropdown, Button, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { myContext } from '../../../App';

export const SettingsDropdown = () => {
  const { setEdit } = useContext(myContext);

  // placeholder items for the dropdown
  const items = [
    {
      label: 'Edit',
      key: '0',
    },
    {
      label: 'Delete',
      key: '1',
      danger: true,
    },
  ];

  // onClick for 'Edit' in the dropdown. Sets tableEdit to true to trigger modal to open.
  // The modal has a form to edit the table name, description, and url.
  const onClick = ({ key }) => {
    if (key === '0') setEdit(true);
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
