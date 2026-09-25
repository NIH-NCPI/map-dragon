import {
  Button,
  Input,
  message,
  notification,
  Space,
  Tabs,
  Table,
  Tag
} from 'antd';
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useContext, useEffect, useState } from 'react';
import { getAll, handlePost } from '../Manager/FetchManager';
import { myContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import './Account.scss';
import { DeleteUser } from './DeleteUser';

export const Institutions = () => {
  const { vocabUrl, setDeleteUser } = useContext(myContext);
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
    const raw = newEmails[institutionId]?.trim();
    if (!raw) return;

    const emailList = raw
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    const body =
      emailList.length > 1 ? { emails: emailList } : { email: emailList[0] };
    handlePost(vocabUrl, `admin/institutions/${institutionId}/allowlist`, body)
      .then(() => {
        setNewEmails(prev => ({ ...prev, [institutionId]: '' }));
        fetchInstitutions();
      })
      .then(() =>
        message.success(`${emailList.join(', ')}  added successfully`)
      )
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred adding the email.'
          });
        }
      });
  };

  const items = institutions.map(inst => {
    const rows = [
      ...inst.members.map(m => ({
        key: m.id,
        email: m.email,
        last_login: new Date(m.lastLoginAt.$date).toLocaleString(),
        status: 'active'
      })),
      ...inst.allowedEmails
        .filter(email => !inst.members.some(m => m.email === email))
        .map(email => ({
          key: email,
          email,
          status: 'allowed'
        }))
    ];

    const columns = [
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email'
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: status => (
          <Tag color={status === 'active' ? 'green' : 'default'}>
            {status === 'active' ? 'Active User' : 'Allowed'}
          </Tag>
        )
      },
      {
        title: 'Last Active',
        dataIndex: 'last_login',
        key: 'last_login'
      },
      {
        title: '',
        key: 'delete',
        render: (_, record) => (
          <Button
            danger
            type="text"
            icon={<CloseCircleOutlined />}
            onClick={() => setDeleteUser({ id: inst.id, email: record.email })}
          />
        )
      }
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

          <Input
            placeholder="Add email"
            style={{ width: 260 }}
            value={newEmails[inst.id] || ''}
            onChange={e =>
              setNewEmails(prev => ({
                ...prev,
                [inst.id]: e.target.value
              }))
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
      <DeleteUser fetchInstitutions={fetchInstitutions} />
    </div>
  );
};
