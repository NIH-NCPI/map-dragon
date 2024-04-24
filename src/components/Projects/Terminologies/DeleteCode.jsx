import { message, notification, Popconfirm } from 'antd';
import { handleUpdate } from '../../Manager/FetchManager';
import { useContext } from 'react';
import { myContext } from '../../../App';

export const DeleteCode = ({
  dataSource,
  setDataSource,
  tableData,
  terminology,
  setTerminology,
}) => {
  console.log(terminology.codes);
  const { vocabUrl } = useContext(myContext);
  const handleDelete = index => {
    terminology.codes.splice(index, 1);
    console.log(terminology.codes);

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
      title="Sure to delete?"
      onConfirm={() => handleDelete(tableData.key)}
    >
      <a>Delete</a>
    </Popconfirm>
  );
};
