import { Popconfirm } from 'antd';

export const DeleteCode = ({ dataSource, setDataSource, tableData }) => {
  const handleDelete = key => {
    const newData = dataSource.filter(item => item.key !== key);
    setDataSource(newData);
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
