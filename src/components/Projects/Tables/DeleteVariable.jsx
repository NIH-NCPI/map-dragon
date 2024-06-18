import { Button, message, notification, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { useContext } from 'react';
import { myContext } from '../../../App';

// Deletes a variable from a Table by splicing the object from the array using its index and updating
// the variables array for the Table with a PUT call.
export const DeleteVariable = ({ tableData, table, setTable }) => {
  const { vocabUrl } = useContext(myContext);

  const handleVarDelete = varName => {
    fetch(`${vocabUrl}/Table/${table.id}/variable/${varName}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(() => {
        return fetch(`${vocabUrl}/Table/${table.id}`);
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => {
        setTable(data);
        message.success('Variable deleted successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred deleting the variable. Please try again.',
          });
        }
        return error;
      });
  };

  return (
    <Popconfirm
      title="Are you sure you want to delete this row?"
      onConfirm={() => handleVarDelete(tableData.name)}
    >
      <Button
        size="small"
        shape="circle"
        icon={<DeleteOutlined />}
        className="actions_icon"
      />
    </Popconfirm>
  );
};
