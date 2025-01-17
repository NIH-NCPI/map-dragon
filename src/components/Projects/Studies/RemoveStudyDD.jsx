import { notification, message, Button, Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { RequiredLogin } from '../../Auth/RequiredLogin';
const { confirm } = Modal;

export const RemoveStudyDD = ({ studyId, dd, getStudyDDs }) => {
  const { vocabUrl, setStudy, user } = useContext(myContext);
  const [remove, setRemove] = useState(false);
  const handleSuccess = () => {
    setRemove(true);
  };
  const login = RequiredLogin({ handleSuccess: handleSuccess });

  // Function to remove DD from a study. Runs a DELETE call on the Study id and DD id
  // Then fetches the updated Study data with the DD removed.
  const handleRemove = () => {
    return fetch(`${vocabUrl}/Study/${studyId}/dd/${dd.id}`, {
      method: 'DELETE',
      credentials: 'include',
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
            description: 'An error occurred removing the DD. Please try again.',
          });
        }
        return error;
      })
      .then(() => fetch(`${vocabUrl}/Study/${studyId}`))
      .then(res => res.json())
      .then(data => {
        setStudy(data);
        if (data) {
          getStudyDDs(data);
        } else {
          setLoading(false);
        }
        message.success('Data Dictionary removed successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred loading the updated Study. Please try again.',
          });
        }
        return error;
      });
  };

  // Confirmation dialog asking user to confirm the deletion.
  const showConfirm = () => {
    confirm({
      className: 'delete_DD_confirm',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content:
        '          Are you sure you want to remove the Data Dictionary from the Study?',
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
