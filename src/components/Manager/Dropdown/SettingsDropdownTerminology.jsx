import { useContext } from 'react';
import { Dropdown, Button, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { myContext } from '../../../App';

export const SettingsDropdownTerminology = ({ codes }) => {
  const { setEdit, setClear, setImportState } = useContext(myContext);

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
  const onClick = ({ key }) => {
    switch (key) {
      case '0':
        return setEdit(true);
      case '1':
        return setClear(true);
      case '2':
        return setImportState(true);
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
