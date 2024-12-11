import { Button, Modal, notification } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import './Terminology.scss';

import { useContext } from 'react';
import { myContext } from '../../../App';

export const ResetMappings = ({ terminologyId, editMappings, setReset }) => {
  const { confirm } = Modal;
  const { vocabUrl, user } = useContext(myContext);

  // The mappings for the code in the terminology are deleted when the "Reset" button is clicked
  // The updated data is fetched for the mappings for the code after the current mappings have been deleted.
  // setReset is set to true to open the modal that performs the search for the code again.
  const handleDelete = evt => {
    return fetch(
      `${vocabUrl}/Terminology/${terminologyId}/mapping/${editMappings.code}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ editor: user.email }),
      }
    )
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to delete the mapping.');
        }
      })
      .then(() => {
        return fetch(`${vocabUrl}/Terminology/${terminologyId}/mapping`);
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(() => setReset(true))
      .catch(error => {
        notification.error({
          message: 'Error',
          description: 'An error occurred deleting the mapping(s).',
        });
      });
  };

  // Confirm modal. Deletes mappings on 'ok' click.
  const showConfirm = () => {
    confirm({
      className: 'reset-modal',
      title: 'Delete mappings and reset',
      icon: <ExclamationCircleFilled />,
      content: (
        <span>
          Are you sure you want to <b>delete</b> the mappings?{' '}
        </span>
      ),
      onOk() {
        handleDelete();
      },
    });
  };

  return (
    <Button danger onClick={showConfirm}>
      Reset
    </Button>
  );
};
