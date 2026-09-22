import { Button, Descriptions, Form, Input, Modal } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../App';
import './UserPage.scss';
import { useNavigate } from 'react-router-dom';
import { getAll, handlePost } from '../Manager/FetchManager';

export const UserPage = () => {
  const { user, role, institutionIds, vocabUrl } = useContext(myContext);
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [createToken, setCreateToken] = useState(false);
  const [expiry, setExpiry] = useState(null);
  const [form] = Form.useForm();
  useEffect(() => {
    document.title = 'User Page - MapDragon';
    getAll(vocabUrl, 'tokens', navigate).then(data => {
      setTokens(data);
      setExpiry(data.expiresAt);
    });
  }, []);
  console.log(tokens);
  const expiresAt = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 10);
    // date.setFullYear(date.getFullYear() + 1);
    return date;
  };
  const postToken = values => {
    handlePost(vocabUrl, 'tokens', {
      'name': values.name,
      expiresAt: expiresAt()
    });
  };
  const userItems = [
    { key: 'u1', label: 'Email', children: user },
    { key: 'u2', label: 'Role', children: role },
    {
      key: 'u3',
      label: 'Institutions',
      children: (
        <div className="institution-wrapper">
          {institutionIds.map(id => {
            return (
              <>
                <div>{id}</div>
              </>
            );
          })}
        </div>
      )
    }
  ];

  const tokenItems =
    tokens?.flatMap((t, i) => {
      const isExpired = new Date(t.expiresAt) < new Date();
      return [
        { key: `t${i}-name`, label: 'Name', children: t.name },
        {
          key: `t${i}-expiry`,
          label: 'Expiry Date',
          children: isExpired
            ? 'EXPIRED'
            : new Date(t.expiresAt).toLocaleString()
        }
      ];
    }) ?? [];

  return (
    <div className="user-page-container">
      <div>
        <h2>User Page</h2>

        <Descriptions
          className="descriptions-wrapper"
          title="User Info"
          labelStyle={{
            width: 130,
            backgroundColor: 'rgb(189, 189, 187, 0.1)'
          }}
          contentStyle={{
            backgroundColor: 'rgb(189, 189, 187, 0.1)',
            textWrap: 'wrap'
          }}
          column={1}
          bordered
          items={userItems}
          size="small"
        />
      </div>

      <div className="token-container">
        <Descriptions
          className="tokens-wrapper"
          title="Tokens"
          labelStyle={{
            width: 130,
            backgroundColor: 'rgb(189, 189, 187, 0.1)'
          }}
          contentStyle={{
            backgroundColor: 'rgb(189, 189, 187, 0.1)',
            textWrap: 'wrap'
          }}
          column={2}
          bordered
          items={tokens?.length > 0 ? tokenItems : []}
          size="small"
          extra={
            <Button
              onClick={e => {
                e.preventDefault();
                setCreateToken(true);
              }}
            >
              New token
            </Button>
          }
        />
        {tokens?.length === 0 && (
          <div className="token-font">
            There are no tokens associated with this account
          </div>
        )}
      </div>

      {createToken === true && (
        <Modal
          open={createToken}
          width={'50%'}
          onOk={() => {
            form.validateFields().then(values => {
              postToken(values);
              setCreateToken(false);
            });
          }}
          onCancel={() => setCreateToken(false)}
          closable={false}
          destroyOnHidden={true}
          maskClosable={true}
        >
          <Form form={form} layout="vertical" preserve={false}>
            <h2>New Token</h2>
            <Form.Item
              name="name"
              label="Token Name"
              rules={[
                {
                  required: true,
                  message: 'Please input token name.'
                }
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};
