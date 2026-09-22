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
  const [newToken, setNewToken] = useState(false);
  const [form] = Form.useForm();
  useEffect(() => {
    document.title = 'User Page - MapDragon';
    getAll(vocabUrl, 'tokens', navigate).then(data => setTokens(data));
  }, []);

  const expiresAt = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  };
  const createToken = values => {
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
    tokens?.flatMap((t, i) => [
      { key: `t${i}-name`, label: 'Name', children: t.name },
      { key: `t${i}-expiry`, label: 'Expiry Date', children: t.expiresAt }
    ]) ?? [];
  console.log(newToken);
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
                setNewToken(true);
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

      {newToken === true && (
        <Modal
          open={newToken}
          width={'50%'}
          onOk={() => {
            form.validateFields().then(values => {
              createToken(values);
              setNewToken(false);
            });
          }}
          onCancel={() => setNewToken(false)}
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
