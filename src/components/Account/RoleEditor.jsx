import { useContext, useState } from 'react';
import { Tag, Button, Dropdown, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { handlePost } from '../Manager/FetchManager';
import { myContext } from '../../App';

export const RoleEditor = ({ record, setAllUsers, disabledRole }) => {
  const { role, vocabUrl } = useContext(myContext);
  const [userRole, setUserRole] = useState(record.role);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async ({ key }) => {
    if (key === userRole || loading) return;

    setLoading(true);

    const action = key === 'admin' ? 'promote' : 'demote';

    try {
      await handlePost(vocabUrl, `admin/users/${record.id}/${action}`);

      setAllUsers(prev =>
        prev.map(u => (u.id === record.id ? { ...u, userRole: key } : u))
      );

      setUserRole(key);
    } catch (error) {
      message.error(`Error updating role`);
    } finally {
      setLoading(false);
    }
  };

  const items = [
    { key: 'admin', label: 'Admin' },
    { key: 'user', label: 'User' }
  ];

  const roleTag = (
    <Tag
      color={
        record.disabledAt
          ? undefined
          : userRole === 'admin'
            ? 'blue'
            : 'default'
      }
      style={
        record.disabledAt
          ? {
              color: '#b4b4b4',
              borderColor: '#b4b4b4',
              background: 'transparent'
            }
          : {}
      }
    >
      {userRole?.toUpperCase()}
    </Tag>
  );

  return role === 'admin' ? (
    <Dropdown
      menu={{
        items,
        selectable: true,
        selectedKeys: [userRole],
        onClick: handleRoleChange
      }}
      trigger={['click']}
      disabled={disabledRole || loading}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          cursor:
            role !== 'admin' ? 'default' : disabledRole ? 'default' : 'pointer'
        }}
      >
        {roleTag}

        {role === 'admin' && !disabledRole && (
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            loading={loading}
            style={{ color: '#888' }}
          />
        )}
      </span>
    </Dropdown>
  ) : (
    roleTag
  );
};
