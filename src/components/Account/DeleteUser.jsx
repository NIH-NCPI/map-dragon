import { useContext, useState } from 'react';
import { apiFetch } from '../Manager/ApiFetch';
import { Modal, notification, Spin } from 'antd';
import { myContext } from '../../App';
import { ExclamationCircleFilled } from '@ant-design/icons';

export const DeleteUser = ({ fetchInstitutions }) => {
  const { confirm } = Modal;
  const { deleteUser, setDeleteUser, vocabUrl } = useContext(myContext);
  const [loading, setLoading] = useState(false);
  const removeEmail = (institutionId, email) => {
    setLoading(true);
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
      })
      .then(() => {
        setLoading(false);
        setDeleteUser(null);
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

  return (
    <Modal
      open={!!deleteUser}
      className="clear-mappings"
      title={
        <span>
          <ExclamationCircleFilled
            style={{ color: '#faad14', marginRight: 8 }}
          />
          Alert
        </span>
      }
      onOk={() => removeEmail(deleteUser?.id, deleteUser?.email)}
      onCancel={() => setDeleteUser(null)}
      okButtonProps={{ disabled: loading }}
      cancelButtonProps={{ disabled: loading }}
      closable={false}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden={true}
    >
      {loading && (
        <div className="loading_overlay_modal">
          <Spin />
        </div>
      )}
      <span>{`Are you sure you want to delete user, ${deleteUser?.email}?`}</span>
    </Modal>
  );
};
