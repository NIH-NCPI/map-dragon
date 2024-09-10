import { Button, Input, Space, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export const OntologyTable = ({ ontology }) => {
  // Column data with filter functionality for ontology names and curies
  const columns = [
    {
      title: 'Ontology',
      dataIndex: 'ontology',
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search Ontology`}
            value={selectedKeys[0]}
            onChange={e => {
              setSelectedKeys(e.target.value ? [e.target.value] : []);
              confirm({ closeDropdown: false });
            }}
            style={{ display: 'block', marginBottom: 8 }}
          />
          <Space>
            <Button
              onClick={() => {
                clearFilters();
                setSelectedKeys([]);
                confirm({ closeDropdown: false });
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record?.ontology
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        record?.curie?.toString().toLowerCase().includes(value.toLowerCase()),
      filterIcon: filtered => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      width: 400,
    },

    {
      title: 'Curie',
      dataIndex: 'curie',
      width: 100,
    },
    {
      title: 'Version',
      dataIndex: 'version',
      width: 200,
    },
  ];

  const dataSource = ontology.flatMap(item =>
    Object.values(item?.ontologies).map((ont, i) => ({
      key: i,
      ontology: ont.ontology_title,
      curie: ont.curie,
      version: ont.version,
    }))
  );

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={{
        pageSize: 50,
      }}
      scroll={{
        y: 470,
      }}
    />
  );
};
