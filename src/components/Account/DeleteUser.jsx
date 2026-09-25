import { useContext } from 'react';
import { apiFetch } from '../Manager/ApiFetch';
import { Modal, notification } from 'antd';
import { myContext } from '../../App';
import { ExclamationCircleFilled } from '@ant-design/icons';

export const DeleteUser = ({ fetchInstitutions }) => {
  const { confirm } = Modal;
  const { deleteUser, setDeleteUser, vocabUrl } = useContext(myContext);
  const removeEmail = (institutionId, email) => {
    apiFetch(
      `${vocabUrl}/admin/institutions/${institutionId}/allowlist/${encodeURIComponent(email)}`,
      {
        method: 'DELETE'
      }
    )
      .then(res => {
        if (!res.ok) {
          return res.json().then(error => {
            throw new Error(error.message || 'An error occurred.');
          });
        }

        return res.json();
      })
      .then(() => {
        fetchInstitutions();
      })
      .catch(error => {
        notification.error({
          message: 'Error',
          description: error.message || 'An error occurred removing the email.'
        });
      });
  };

  const showConfirm = () => {
    confirm({
      className: 'clear-mappings',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content: (
        <span>{`Are you sure you want to delete user, ${deleteUser.email}?`}</span>
      ),
      onOk() {
        removeEmail(deleteUser?.id, deleteUser?.email);
        setDeleteUser(null);
      },
      onCancel() {
        setDeleteUser(null);
      }
    });
  };

  return deleteUser && showConfirm();
};
