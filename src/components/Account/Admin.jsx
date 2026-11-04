import { Button, notification, Spin, Table } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { getAll } from '../Manager/FetchManager';
import { myContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import './Account.scss';
import { UserAction } from './UserAction';
import { RoleEditor } from './RoleEditor';

export const Admin = () => {
  const { user, role, vocabUrl } = useContext(myContext);
  const [allUsers, setAllUsers] = useState([]);
  const [actionState, setActionState] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = () => {
    getAll(vocabUrl, 'admin/users', navigate)
      .then(data => setAllUsers(data))
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred fetching sers.'
          });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Admin - MapDragon';
    fetchUsers();
  }, []);
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 220
    },
    {
      title: 'Role',
      dataIndex: 'role',
      width: 200,
      render: (_, record) => (
        <RoleEditor
          record={record}
          setAllUsers={setAllUsers}
          disabledRole={user === record?.email}
          fetchUsers={fetchUsers}
        />
      )
    },
    {
      title: 'Institutions',
      dataIndex: 'institutions',
      width: 180
    },
    {
      title: '',
      width: 250,
      render: (_, record) =>
        record?.disabledAt ? (
          <div className="disabled_div">
            <div>
              <Button
                color="green"
                variant="outlined"
                size="small"
                disabled={user === record?.email || role !== 'admin'}
                onClick={() =>
                  setActionState({
                    id: record?.id,
                    name: record?.name,
                    action: 'enable'
                  })
                }
              >
                Enable
              </Button>
            </div>
            <div style={{ fontSize: '13px' }}>
              Disabled at {new Date(record?.disabledAt.$date).toLocaleString()}
            </div>
          </div>
        ) : (
          <Button
            danger
            size="small"
            disabled={user === record?.email || role !== 'admin'}
            onClick={() =>
              setActionState({
                id: record?.id,
                name: record?.name,
                action: 'disable'
              })
            }
          >
            Disable
          </Button>
        )
    }
  ];
  const dataSource = allUsers.flatMap((au, i) => ({
    key: i,
    name: au.displayName,
    email: au.email,
    role: au.role,
    institutions: au.institutionIds.join(', '),
    disabledAt: au.disabledAt,
    disabledBy: au.disabledBy,
    id: au.id
  }));

  return (
    <>
      {loading && (
        <div className="loading_overlay">
          <Spin />
        </div>
      )}
      <div className="account-container">
        <div>
          <div className="institutions-header">
            <h2>Admin</h2>
          </div>
          <Table
            columns={columns}
            dataSource={dataSource}
            scroll={{ x: 'max-content' }}
            sticky={{ offsetHeader: 80 }}
            rowClassName={record => record.disabledAt && 'disabled_row'}
          />
        </div>
        <UserAction
          actionState={actionState}
          setActionState={setActionState}
          fetchUsers={fetchUsers}
        />
      </div>
    </>
  );
};
