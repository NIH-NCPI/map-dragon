import { Modal, message } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

import { useContext } from 'react';
import { myContext } from '../../../App';
import { useNavigate } from 'react-router-dom';
import { handleDelete } from '../../Manager/FetchManager';

export const DeleteDD = ({ studyId }) => {
  const { confirm } = Modal;
  const { vocabUrl, deleteState, setDeleteState, dataDictionary } =
    useContext(myContext);
  const navigate = useNavigate();

  const deleteDD = evt =>
    handleDelete(evt, vocabUrl, 'DataDictionary', dataDictionary).then(() => {
      message.success('Data Dictionary deleted successfully.');
      navigate(`/Study/${studyId}`);
    });

  // Confirm modal. Deletes DD on 'ok' click.
  const showConfirm = () => {
    confirm({
      className: 'delete_table_confirm',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content: (
        <>
          <div>
            Deleting the data dictionary will permanently delete it and remove
            it from all Studies.
          </div>
          <div>
            <b>Are you sure you want to delete the Data Dictionary?</b>
          </div>
        </>
      ),
      onOk() {
        deleteDD();
        setDeleteState(false);
      },
      onCancel() {
        setDeleteState(false);
      },
    });
  };

  return deleteState && showConfirm();
};
