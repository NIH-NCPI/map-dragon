import { Modal, message, notification } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useContext } from 'react';
import { myContext } from '../../../App';
import { useNavigate } from 'react-router-dom';
import { getAll } from '../../Manager/FetchManager';

export const DeleteTerminology = ({ setTerms, deleteId, setDeleteId }) => {
  const { confirm } = Modal;
  const { vocabUrl, user } = useContext(myContext);
  const navigate = useNavigate();

  // Deletes specified terminology and updates the terminology list
  const deleteTerm = evt => {
    fetch(`${vocabUrl}/Terminology/${deleteId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ editor: user.email }),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred deleteing the Terminology.',
          });
        }
        return error;
      })
      .then(() =>
        getAll(vocabUrl, 'Terminology', navigate).then(data => {
          setTerms(data);
          message.success('Terminology deleted successfully.');
        })
      )
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred loading Terminologies.',
          });
        }
        return error;
      });
  };

  // Confirm modal. Deletes table on 'ok' click.
  const showConfirm = () => {
    confirm({
      className: 'delete_table_confirm',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content: 'Are you sure you want to delete the Terminology?',
      onOk() {
        deleteTerm();
        setDeleteId(null);
      },
      onCancel() {
        setDeleteId(null);
      },
    });
  };

  return deleteId && showConfirm();
};
