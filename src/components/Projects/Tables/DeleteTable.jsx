import { Modal, message, notification } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

import { useContext, useEffect } from 'react';
import { myContext } from '../../../App';
import { useNavigate, useParams } from 'react-router-dom';
import { handleDelete } from '../../Manager/FetchManager';

export const DeleteTable = ({ propDD }) => {
  const { tableId } = useParams();
  const { confirm } = Modal;
  const {
    vocabUrl,
    deleteState,
    setDeleteState,
    table,
    setDataDictionary,
    dataDictionary,
  } = useContext(myContext);
  const navigate = useNavigate();

  const findTableIndex = () => {
    const arrayOfIds = propDD?.tables?.map(table => {
      return table.reference.split('/')[1];
    });
    const foundIndex = arrayOfIds.findIndex(id => id === tableId);
    return foundIndex;
  };

  const updatedTables = propDD?.tables?.splice(findTableIndex, 1);

  const removeTable = () => {
    fetch(`${vocabUrl}/DataDictionary/${propDD.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mappingsDTO()),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => setMapping(data.codes))
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  };

  // Confirm modal. Deletes mappings on 'ok' click.
  const showConfirm = () => {
    confirm({
      className: 'clear-mappings',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content: <span>Are you sure you want to delete the Table?</span>,
      onOk() {
        removeTable();
        setDeleteState(false);
      },
      onCancel() {
        setDeleteState(false);
      },
    });
  };

  return deleteState && showConfirm();
};
