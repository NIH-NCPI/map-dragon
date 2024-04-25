import { message, notification, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { handleUpdate } from '../../Manager/FetchManager';
import { useContext } from 'react';
import { myContext } from '../../../App';

export const DeleteCode = ({ tableData, terminology, setTerminology }) => {
  const { vocabUrl } = useContext(myContext);

  const handleDelete = index => {
    terminology.codes.splice(index, 1);

    handleUpdate(vocabUrl, 'Terminology', terminology, terminology)
      .then(data => {
        setTerminology(data);
        message.success('Code deleted successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred deleting the code. Please try again.',
          });
        }
        return error;
      });
  };

  return (
    <Popconfirm
      title="Are you sure you want to delete the code?"
      onConfirm={() => handleDelete(tableData.key)}
    >
      <DeleteOutlined className="delete_icon" />
    </Popconfirm>
  );
};
