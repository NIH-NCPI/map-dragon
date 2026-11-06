import { useContext, useEffect, useState } from 'react';
import { Dropdown, Button, notification, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { myContext } from '../../../App';

export const SettingsDropdownTerminology = ({ codes }) => {
  const { setEdit, setClear, setImportState, user } = useContext(myContext);

  const [emptyCodesError, setEmptyCodesError] = useState(false);

  useEffect(() => {
    if (!codes && !emptyCodesError) {
      notification.error({
        duration: 30,
        placement: 'top',
        message: 'Error',
        description: (
          <div>
            <div>
              Please take a screenshot or copy and paste this error message for
              your admin, along with the URL that resulted in the error:
            </div>
            <div>"codes" property is absent.</div>
          </div>
        )
      });
      setEmptyCodesError(true); // Ensures the error doesn't trigger again
    }
  }, [codes, emptyCodesError]);

  const items = [
    {
      label: 'Edit',
      key: '0'
    },
    {
      label: 'Clear mapped terms',
      key: '1',
      danger: true
    }
  ];

  if (codes?.length < 1 || !codes) {
    items.unshift({
      label: 'Import CSV',
      key: '2'
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
    onClick
  };

  return (
    <Dropdown menu={menuProps} style={{ width: '30vw' }}>
      <Button>
        <Space
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: 100
          }}
        >
          Settings
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};
