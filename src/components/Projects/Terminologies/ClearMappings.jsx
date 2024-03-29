import { Modal, message, notification } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import './Terminology.scss';

import { useContext, useEffect } from 'react';
import { myContext } from '../../../App';

export const ClearMappings = ({ terminologyId }) => {
  const { confirm } = Modal;
  const { vocabUrl, clear, setClear } = useContext(myContext);

  // The mappings for the code in the terminology are deleted when the "Reset" button is clicked
  // The updated data is fetched for the mappings for the code after the current mappings have been deleted.
  // setReset is set to true to open the modal that performs the search for the code again.
  const handleDelete = evt => {
    return fetch(`${vocabUrl}/Terminology/${terminologyId}/mapping`, {
      method: 'DELETE',
    })
      .then(res => {
        console.log(res);
        if (res.ok) {
          return res
            .json()
            .then(() => message.success('Changes saved successfully.'));
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(() => {
        return fetch(`${vocabUrl}/Terminology/${terminologyId}/mapping`);
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.',
          });
        }
        return error;
      });
  };

  // Confirm modal. Deletes mappings on 'ok' click.
  const showConfirm = () => {
    confirm({
      className: 'clear-mappings',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content: <span>Are you sure you want to clear all mappings?</span>,
      onOk() {
        handleDelete();
        setClear(false);
      },
      onCancel() {
        setClear(false);
      },
    });
  };

  return clear && showConfirm();
};
