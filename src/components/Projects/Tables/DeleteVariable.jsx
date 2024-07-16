import { Button, message, notification, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { useContext } from 'react';
import { myContext } from '../../../App';

// Deletes a variable from a Table by splicing the object from the array using its index and updating
// the variables array for the Table with a PUT call.
export const DeleteVariable = ({
  tableData,
  table,
  setTable,
  deleteRow,
  setDeleteRow,
}) => {
  const { vocabUrl } = useContext(myContext);

  const handleVarDelete = varName => {
    fetch(`${vocabUrl}/Table/${table.id}/variable/${varName}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (res.ok) {
          return res.json().then(data => {
            message.success('Variable deleted successfully.');
          });
        } else {
          notification.error({
            message: 'Error',
            description: 'An error occurred deleting the variable.',
          });
        }
      })
      .then(() => {
        return fetch(`${vocabUrl}/Table/${table.id}`);
      })
      .then(res => {
        if (res.ok) {
          return res.json().then(data => {
            setTable(data);
          });
        } else {
          notification.error({
            message: 'Error',
            description: 'An error occurred loading the Table.',
          });
        }
      });
  };

  const showConfirm = () => {
    confirm({
      className: 'delete_table_confirm',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content: (
        <>
          <div>Are you sure you want to delete this row? </div>
        </>
      ),
      onOk() {
        handleVarDelete(tableData.name);
      },
      onCancel() {
        setDeleteRow(false);
      },
    });
  };
  return deleteRow && showConfirm;
};
