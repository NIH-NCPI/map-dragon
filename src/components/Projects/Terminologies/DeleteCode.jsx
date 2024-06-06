import { Button, message, notification, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { handleUpdate } from '../../Manager/FetchManager';
import { useContext } from 'react';
import { myContext } from '../../../App';

export const DeleteCode = ({ tableData, terminology, setTerminology }) => {
  const { vocabUrl } = useContext(myContext);
  // Deletes a code from a Terminology by splicing the object from the array using its index and updating
  // the codes array for the Terminology with a PUT call.
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
      title="Are you sure you want to delete this row?"
      onConfirm={() => handleDelete(tableData.key)}
    >
      <Button
        shape="circle"
        size="small"
        icon={<DeleteOutlined />}
        className="actions_icon"
      />
    </Popconfirm>
  );
};
