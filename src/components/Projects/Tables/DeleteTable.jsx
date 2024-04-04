import { Modal, message } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

import { useContext } from 'react';
import { myContext } from '../../../App';
import { useNavigate, useParams } from 'react-router-dom';
import { handleDelete } from '../../Manager/FetchManager';

export const DeleteTable = () => {
  const { confirm } = Modal;
  const { vocabUrl, deleteState, setDeleteState, table } =
    useContext(myContext);
  const navigate = useNavigate();

  const deleteTable = evt =>
    handleDelete(evt, vocabUrl, 'Table', table).then(() => {
      message.success('Table deleted successfully.');
      navigate(`/studies`);
    });

  // Confirm modal. Deletes mappings on 'ok' click.
  const showConfirm = () => {
    confirm({
      className: 'clear-mappings',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content: <span>Are you sure you want to delete the Table?</span>,
      onOk() {
        deleteTable();
        setDeleteState(false);
      },
      onCancel() {
        setDeleteState(false);
      },
    });
  };

  return deleteState && showConfirm();
};
