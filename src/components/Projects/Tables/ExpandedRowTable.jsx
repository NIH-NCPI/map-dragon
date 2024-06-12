import { Table } from 'antd';

export const ExpandedRowTable = ({ record }) => {
  const columns = [
    {
      title: 'Min',
      dataIndex: 'min',
      key: 'min',
    },
    {
      title: 'Max',
      dataIndex: 'max',
      key: 'max',
    },
    {
      title: 'Units',
      key: 'units',
      dataIndex: 'units',
    },
  ];

  const dataSource = [
    { key: 1, min: record.min, max: record.max, units: record.units },
  ];

  return <Table columns={columns} dataSource={dataSource} pagination={false} />;
};
