import { Tabs, Table, Tag, Button, Input, Space, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useContext, useEffect, useState } from 'react';
import { getAll, handlePost } from '../Manager/FetchManager';
import { myContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import './Account.scss';

export const Institutions = () => {
  const { vocabUrl } = useContext(myContext);
  const [institutions, setInstitutions] = useState([]);
  const [newEmails, setNewEmails] = useState({}); // { [institutionId]: 'typed email' }
  const navigate = useNavigate();

  const fetchInstitutions = () => {
    getAll(vocabUrl, 'admin/institutions', navigate)
      .then(data => setInstitutions(data))
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred fetching institutions.'
          });
        }
      });
  };

  useEffect(() => {
    document.title = 'Institutions - MapDragon';
    fetchInstitutions();
  }, []);

  const addEmail = institutionId => {
    const email = newEmails[institutionId]?.trim();
    if (!email) return;
    handlePost(vocabUrl, `/admin/institutions/${institutionId}/allowlist`, {
      'email': email
    }).then(() => {
      setNewEmails(prev => ({ ...prev, [institutionId]: '' }));
      fetchInstitutions();
    });
  };

  const columns = [
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? 'Active User' : 'Allowed'}
        </Tag>
      )
    }
  ];

  const items = institutions.map(inst => {
    const rows = [
      ...inst.memberIds.map(m => ({
        key: m.id,
        email: m.email,
        status: 'active'
      })),
      ...inst.allowedEmails
        .filter(email => !inst.memberIds.some(m => m.email === email))
        .map(email => ({ key: email, email, status: 'allowed' }))
    ];

    return {
      key: inst.id,
      label: inst.name,
      children: (
        <>
          <Table
            columns={columns}
            dataSource={rows}
            pagination={false}
            size="small"
          />
          <Space style={{ marginTop: 16 }}>
            <Input
              placeholder="Add email"
              style={{ width: 260 }}
              value={newEmails[inst.id] || ''}
              onChange={e =>
                setNewEmails(prev => ({ ...prev, [inst.id]: e.target.value }))
              }
              onPressEnter={() => addEmail(inst.id)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => addEmail(inst.id)}
            >
              Add
            </Button>
          </Space>
        </>
      )
    };
  });

  return (
    <div className="account-container">
      <div>
        <h2>Institutions</h2>
        <Tabs items={items} />
      </div>
    </div>
  );
};
