import { notification, message, Button, Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { RequiredLogin } from '../../Auth/RequiredLogin';
const { confirm } = Modal;

export const RemoveTableDD = ({ DDId, table, getDDTables }) => {
  const { vocabUrl, setDataDictionary, user } = useContext(myContext);
  const [remove, setRemove] = useState(false);

  const handleSuccess = () => {
    setRemove(true);
  };
  const login = RequiredLogin({ handleSuccess: handleSuccess });

  // Function to remove table from a DD. Runs a DELETE call on the DD id and table id
  // Then fetches the updated DD data with the table removed.
  const handleRemove = () => {
    return fetch(`${vocabUrl}/DataDictionary/${DDId}/Table/${table.id}`, {
      method: 'DELETE',
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
            description:
              'An error occurred removing the Table. Please try again.',
          });
        }
        return error;
      })
      .then(() => fetch(`${vocabUrl}/DataDictionary/${DDId}`))
      .then(res => res.json())
      .then(data => {
        setDataDictionary(data);
        if (data) {
          getDDTables(data);
        } else {
          setLoading(false);
        }
        message.success('Table removed successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred loading the updated Data Dictionary. Please try again.',
          });
        }
        return error;
      });
  };

  // Confirmation dialog asking user to confirm the deletion.
  const showConfirm = () => {
    confirm({
      className: 'delete_table_confirm',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content:
        '          Are you sure you want to remove the Table from the Data Dictionary?',
      onOk() {
        handleRemove();
        setRemove(false);
      },
      onCancel() {
        setRemove(false);
      },
    });
  };

  return (
    <>
      <Button danger onClick={() => (user ? setRemove(true) : login())}>
        Remove
      </Button>
      {remove && showConfirm()}
    </>
  );
};
