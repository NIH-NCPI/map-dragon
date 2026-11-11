import { useContext, useState } from 'react';
import { handlePost } from '../Manager/FetchManager';
import { message, Modal, notification, Spin } from 'antd';
import { myContext } from '../../App';
import { ExclamationCircleFilled } from '@ant-design/icons';

export const UserAction = ({ actionState, setActionState, fetchUsers }) => {
  const [loading, setLoading] = useState(false);
  const { vocabUrl } = useContext(myContext);

  const handleAction = () => {
    setLoading(true);
    handlePost(
      vocabUrl,
      `admin/users/${actionState?.id}/${actionState?.action}`
    )
      .then(() => fetchUsers())
      .then(() => {
        message.success(`User, ${actionState?.name}, ${actionState?.action}d`);
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: error.message
          });
        }
      })
      .then(() => {
        setLoading(false);
        setActionState(null);
      });
  };

  return (
    <Modal
      open={actionState}
      className="clear-mappings"
      title={
        <span>
          <ExclamationCircleFilled
            style={{ color: '#faad14', marginRight: 8 }}
          />
          Alert
        </span>
      }
      onOk={() => handleAction()}
      onCancel={() => setActionState(null)}
      okButtonProps={{ disabled: loading }}
      cancelButtonProps={{ disabled: loading }}
      closable={false}
      maskClosable={false}
      destroyOnHidden={true}
    >
      {loading && (
        <div className="loading_overlay_modal">
          <Spin />
        </div>
      )}
      <span>{`Are you sure you want to ${actionState?.action} user, ${actionState?.name}?`}</span>
    </Modal>
  );
};
