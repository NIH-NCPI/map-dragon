import { useContext } from 'react';
import { Dropdown, Button, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { myContext } from '../../../App';

export const SettingsDropdownStudy = () => {
  const { setEdit, setDeleteState } = useContext(myContext);

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
  const onClick = ({ key }) => {
    switch (key) {
      case '0':
        return setEdit(true);
      case '2':
        return setDeleteState(true);
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
