import { Button, Descriptions } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../App';
import './Account.scss';
import { useNavigate } from 'react-router-dom';
import { getAll } from '../Manager/FetchManager';
import { CloseCircleOutlined } from '@ant-design/icons';
import { DeleteToken } from './DeleteToken';
import { CreateToken } from './CreateToken';

export const UserPage = () => {
  const { user, role, institutionIds, vocabUrl, setDeleteToken } =
    useContext(myContext);
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [createToken, setCreateToken] = useState(false);

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

  const userItems = [
    { key: 'u1', label: 'Email', children: user },
    { key: 'u2', label: 'Role', children: role },
    {
      key: 'u3',
      label: 'Institutions',
      children: (
        <div className="institution-wrapper">
          {institutionIds.map((id, i) => {
            return (
              <>
                <div key={i}>{id}</div>
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
      <div className="account-container">
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
          <CreateToken
            createToken={createToken}
            setCreateToken={setCreateToken}
            setTokens={setTokens}
          />
        )}
      </div>
      <DeleteToken setTokens={setTokens} />
    </>
  );
};
