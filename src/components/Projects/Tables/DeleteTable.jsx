import { Modal, message } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

import { useContext } from 'react';
import { myContext } from '../../../App';
import { useNavigate } from 'react-router-dom';
import { handleDelete } from '../../Manager/FetchManager';

export const DeleteTable = ({ DDId, studyId }) => {
  const { confirm } = Modal;
  const { vocabUrl, deleteState, setDeleteState, table } =
    useContext(myContext);
  const navigate = useNavigate();

  const deleteTable = evt =>
    handleDelete(evt, vocabUrl, 'Table', table).then(() => {
      message.success('Table deleted successfully.');
      navigate(`/Study/${studyId}/DataDictionary/${DDId}`);
    });

  // Confirm modal. Deletes table on 'ok' click.
  const showConfirm = () => {
    confirm({
      className: 'delete_table_confirm',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content: (
        <>
          <div>
            This will delete the table and remove it from all Data Dictionaries.
          </div>
          <div>
            <b>Are you sure you want to delete the Table?</b>
          </div>
        </>
      ),
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
