import {
  Button,
  Form,
  message,
  notification,
  Select,
  Space,
  Spin,
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
import { useForm } from 'antd/es/form/Form';
import { AddInstitution } from './AddInstitution';

export const Institutions = () => {
  const [form] = useForm();
  const { vocabUrl, setDeleteUser, role } = useContext(myContext);
  const [institutions, setInstitutions] = useState([]);
  const [addInst, setAddInst] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emailLoading, setEmailLoading] = useState(false);
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
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Institutions - MapDragon';
    fetchInstitutions();
  }, []);

  const addEmail = (institutionId, rawValue) => {
    const raw = rawValue?.trim();
    if (!raw) return;

    const emailList = raw
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    const body =
      emailList.length > 1 ? { emails: emailList } : { email: emailList[0] };
    setEmailLoading(true);

    handlePost(vocabUrl, `admin/institutions/${institutionId}/allowlist`, body)
      .then(() => fetchInstitutions())
      .then(() => {
        message.success(`${emailList.join(', ')} added successfully`);
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: error.message
          });
        }
      })
      .finally(() => setEmailLoading(false));
  };

  const handleAddEmail = instId => {
    const field = `email_${instId}`;

    form
      .validateFields([field])
      .then(values => {
        const emails = (values[field] ?? []).map(e => e.trim()).filter(Boolean);
        if (emails.length === 0) return;
        addEmail(instId, emails.join(','));
        form.resetFields([field]);
      })
      .catch(() => {});
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
        key: 'email',
        width: 300
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: status => (
          <Tag color={status === 'active' ? 'green' : 'default'}>
            {status === 'active' ? 'Active User' : 'Allowed'}
          </Tag>
        )
      },
      {
        title: 'Last Active',
        dataIndex: 'last_login',
        key: 'last_login',
        width: 250
      },
      {
        title: '',
        key: 'delete',
        render: (_, record) => (
          <Button
            danger
            type="text"
            icon={role === 'admin' && <CloseCircleOutlined />}
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
            scroll={{ x: 'max-content' }}
            width="max-content"
            sticky={{ offsetHeader: 80 }}
            columns={columns}
            dataSource={rows}
            size="small"
          />

          {role === 'admin' && (
            <div style={{ position: 'relative', marginBottom: 20 }}>
              {emailLoading && (
                <div className="loading_overlay_modal">
                  <Spin />
                </div>
              )}

              <div
                style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
              >
                <Form.Item
                  name={`email_${inst.id}`}
                  label="Users"
                  style={{ flex: 1, marginBottom: 0 }}
                  rules={[
                    {
                      type: 'array',
                      defaultField: {
                        type: 'email',
                        message: 'Please input a valid email address.'
                      }
                    }
                  ]}
                >
                  <Select
                    mode="tags"
                    placeholder="Add email(s)"
                    tokenSeparators={[',', ' ']}
                    open={false}
                    autoComplete="off"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddEmail(inst.id)}
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </>
      )
    };
  });

  return (
    <>
      <Form form={form} component={false}>
        {loading && (
          <div className="loading_overlay">
            <Spin />
          </div>
        )}
        <div className="account-container">
          <div>
            <div className="institutions-header">
              <h2>Institutions</h2>
              {role === 'admin' && (
                <Button
                  type="primary"
                  shape="circle"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setAddInst(true)}
                />
              )}
            </div>
            <Tabs items={items} />
          </div>
          <DeleteUser fetchInstitutions={fetchInstitutions} />
          <AddInstitution
            addInst={addInst}
            setAddInst={setAddInst}
            setInstitutions={setInstitutions}
          />
        </div>
      </Form>
    </>
  );
};
