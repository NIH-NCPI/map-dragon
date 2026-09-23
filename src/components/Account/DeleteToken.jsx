import { useContext } from 'react';
import { apiFetch } from '../Manager/ApiFetch';
import { getAll } from '../Manager/FetchManager';
import { Modal, notification } from 'antd';
import { myContext } from '../../App';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const DeleteToken = ({ setTokens, setExpiry }) => {
  const { confirm } = Modal;
  const { deleteToken, setDeleteToken, vocabUrl } = useContext(myContext);
  const navigate = useNavigate();

  const handleDelete = () =>
    apiFetch(
      `${vocabUrl}/tokens/${deleteToken.tokenId}`,
      {
        method: 'DELETE'
      },
      navigate
    )
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred deleting the token.'
          });
        }
      })
      .then(() => {
        getAll(vocabUrl, 'tokens', navigate).then(data => {
          setTokens(data);
          setExpiry(data?.expiresAt);
        });
      });

  const showConfirm = () => {
    confirm({
      className: 'clear-mappings',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content: (
        <span>{`Are you sure you want to delete token, ${deleteToken.name}?`}</span>
      ),
      onOk() {
        handleDelete();
        setDeleteToken(null);
      },
      onCancel() {
        setDeleteToken(null);
      }
    });
  };

  return deleteToken && showConfirm();
};
