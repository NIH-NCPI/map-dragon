import { Modal, message } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

import { useContext } from 'react';
import { myContext } from '../../../App';
import { useNavigate, useParams } from 'react-router-dom';
import { handleDelete } from '../../Manager/FetchManager';

export const DeleteStudy = () => {
  const { confirm } = Modal;
  const { vocabUrl, deleteState, setDeleteState, study } =
    useContext(myContext);
  const navigate = useNavigate();

  const deleteStudy = evt =>
    handleDelete(evt, vocabUrl, 'Study', study).then(() => {
      message.success('Study deleted successfully.');
      navigate(`/studies`);
    });

  // Confirm modal. Deletes mappings on 'ok' click.
  const showConfirm = () => {
    confirm({
      className: 'clear-mappings',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content: <span>Are you sure you want to delete the Study?</span>,
      onOk() {
        deleteStudy();
        setDeleteState(false);
      },
      onCancel() {
        setDeleteState(false);
      },
    });
  };

  return deleteState && showConfirm();
};
