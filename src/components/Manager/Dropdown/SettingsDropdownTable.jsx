import { useContext } from 'react';
import { Dropdown, Button, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { myContext } from '../../../App';

export const SettingsDropdownTable = () => {
  const { setEdit, setClear, setDeleteState, setExportState } =
    useContext(myContext);

  const items = [
    {
      label: 'Edit',
      key: '0',
    },
    {
      label: 'Export mapped terms',
      key: '1',
    },
    {
      label: 'Clear mapped terms',
      key: '2',
      danger: true,
    },
    {
      label: 'Delete',
      key: '3',
      danger: true,
    },
  ];

  // onClick for dropdown. Sets states to true depending on their key.
  // A modal is then triggered to open in the component to perform the desired task.
  const onClick = ({ key }) => {
    switch (key) {
      case '0':
        return setEdit(true);
      case '1':
        return setExportState(true);
      case '2':
        return setClear(true);
      case '3':
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
