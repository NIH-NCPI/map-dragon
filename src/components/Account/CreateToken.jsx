import { Button, Input, Form, Modal, notification, Tooltip } from 'antd';
import { CopyOutlined, WarningTwoTone } from '@ant-design/icons';
import { getAll, handlePost } from '../Manager/FetchManager';
import { useContext, useState } from 'react';
import { myContext } from '../../App';
import { useNavigate } from 'react-router-dom';

export const CreateToken = ({ createToken, setCreateToken, setTokens }) => {
  const [form] = Form.useForm();
  const { vocabUrl } = useContext(myContext);
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(0);
  const [displayToken, setDisplayToken] = useState(0);
  const navigate = useNavigate();

  const expiresAt = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  };

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

  return (
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
        <WarningTwoTone style={{ fontSize: '20px' }} /> The token will only be
        shown once. Make sure it is saved somewhere safe!
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
  );
};
