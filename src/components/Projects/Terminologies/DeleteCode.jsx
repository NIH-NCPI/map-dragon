import { Button, message, notification, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { useContext } from 'react';
import { myContext } from '../../../App';

export const DeleteCode = ({ tableData, terminology, setTerminology }) => {
  const { vocabUrl } = useContext(myContext);

  const handleCodeDelete = code => {
    fetch(`${vocabUrl}/Terminology/${terminology.id}/code/${code}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (res.ok) {
          return res.json().then(data => {
            message.success('Code deleted successfully.');
          });
        } else {
          notification.error({
            message: 'Error',
            description: 'An error occurred deleting the code.',
          });
        }
      })
      .then(() => {
        return fetch(`${vocabUrl}/Terminology/${terminology.id}`);
      })
      .then(res => {
        if (res.ok) {
          return res.json().then(data => {
            setTerminology(data);
          });
        } else {
          notification.error({
            message: 'Error',
            description: 'An error occurred loading the Terminology.',
          });
        }
      });
  };

  return (
    <Popconfirm
      title="Are you sure you want to delete this row?"
      onConfirm={() => handleCodeDelete(tableData.code)}
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
