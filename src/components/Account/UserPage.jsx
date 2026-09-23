import { Button, Descriptions, Form, Input, Modal, Tooltip } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../App';
import './UserPage.scss';
import { useNavigate } from 'react-router-dom';
import { getAll, handlePost } from '../Manager/FetchManager';
import {
  CloseCircleOutlined,
  CopyOutlined,
  WarningTwoTone
} from '@ant-design/icons';
import { DeleteToken } from './DeleteToken';

export const UserPage = () => {
  const { user, role, institutionIds, vocabUrl, setDeleteToken } =
    useContext(myContext);
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [createToken, setCreateToken] = useState(false);
  const [showToken, setShowToken] = useState(0);
  const [displayToken, setDisplayToken] = useState(0);
  const [copied, setCopied] = useState(false);
  const [form] = Form.useForm();

  // Make sure to copy your personal access token now. You won’t be able to see it again!

  useEffect(() => {
    document.title = 'User Page - MapDragon';
    getAll(vocabUrl, 'tokens', navigate)
      .then(data => {
        setTokens(data);
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred fetching user tokens.'
          });
        }
      });
  }, []);

  const postToken = values => {
    handlePost(vocabUrl, 'tokens', {
      'name': values.name,
      expiresAt: expiresAt()
    })
      .then(data => setDisplayToken(data.token))
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred creating the token.'
          });
        }
      });
  };

  const expiresAt = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
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
      const isExpired = new Date(t.expiresAt + 'Z') < new Date();

      return [
        { key: `t${i}-name`, label: 'Name', children: t.name },
        {
          key: `t${i}-expiry`,
          label: 'Expires',
          children: (
            <div className="expires-div">
              <div>
                {isExpired ? (
                  <span style={{ fontWeight: '600', color: 'red' }}>
                    EXPIRED
                  </span>
                ) : (
                  new Date(t.expiresAt + 'Z').toLocaleString()
                )}
              </div>
              <div
                className="delete-token-icon"
                onClick={e => {
                  e.stopPropagation();
                  setDeleteToken(t);
                }}
              >
                <CloseCircleOutlined style={{ color: 'red' }} />
              </div>
            </div>
          )
        }
      ];
    }) ?? [];
  return (
    <>
      <div className="user-page-container">
        <div>
          <h2>User Page</h2>

          <Descriptions
            className="descriptions-wrapper"
            title="User Info"
            styles={{
              label: {
                width: 80,
                backgroundColor: 'rgb(255, 255, 255, 0.6)'
              },
              content: {
                backgroundColor: 'rgb(255, 255, 255, 0.6)',
                textWrap: 'wrap'
              }
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
            styles={{
              label: {
                width: 80,
                backgroundColor: 'rgb(255, 255, 255, 0.6)'
              },
              content: {
                backgroundColor: 'rgb(255, 255, 255, 0.6)',
                textWrap: 'wrap'
              }
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
            closable={false}
            destroyOnHidden={true}
            maskClosable={true}
            footer={
              showToken ? (
                <Button
                  type="primary"
                  onClick={() => {
                    getAll(vocabUrl, 'tokens', navigate).then(data => {
                      setShowToken(false);
                      setCreateToken(false);
                      setTokens(data);
                    });
                  }}
                >
                  Close
                </Button>
              ) : (
                <>
                  <Button onClick={() => setCreateToken(false)}>Cancel</Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      form.validateFields().then(values => {
                        postToken(values);
                        setShowToken(true);
                      });
                    }}
                  >
                    Create
                  </Button>
                </>
              )
            }
          >
            <Form form={form} layout="vertical" preserve={false}>
              <h2>New Token</h2>
              <WarningTwoTone style={{ fontSize: '20px' }} /> The token will
              only be shown once. Make sure it is saved somewhere safe!
              <p></p>
              {showToken ? (
                <div className="token-display">
                  <div>{displayToken}</div>
                  <div>
                    <Tooltip title="Copied!" open={copied} placement="top">
                      <CopyOutlined
                        className="copy-icon"
                        onClick={() => {
                          navigator.clipboard.writeText(displayToken);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1200);
                        }}
                      />
                    </Tooltip>
                  </div>
                </div>
              ) : (
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
              )}
            </Form>
          </Modal>
        )}
      </div>
      <DeleteToken setTokens={setTokens} />
    </>
  );
};
