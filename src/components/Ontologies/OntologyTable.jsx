import { Button, Input, Space, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

export const OntologyTable = ({ ontology }) => {
  const [filter, setFilter] = useState(null);

  const [pageSize, setPageSize] = useState(
    parseInt(localStorage.getItem('pageSize'), 10) || 10);
  const handleTableChange = (current, size) => {
    setPageSize(size);
  };
  useEffect(() => {
    localStorage.setItem('pageSize', pageSize);
  }, [pageSize]);

  const ontologyTitle = () => {
    return (
      <div className="ontology_filter">
        <div>Ontology</div>
        {filter?.length > 0 ? <div>Filtering by '{filter}'</div> : ''}
      </div>
    );
  };

  // Column data with filter functionality for ontology names and curies
  const columns = [
    {
      title: ontologyTitle(),
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
              setFilter(e.target.value ? [e.target.value] : []);
              confirm({ closeDropdown: false });
            }}
            style={{ display: 'block', marginBottom: 8 }}
          />
          <Space>
            <Button
              onClick={() => {
                clearFilters();
                setSelectedKeys([]);
                setFilter(null);
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
      scroll={{
        y: 470,
      }}
      pagination={{
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '30'],
        pageSize: pageSize, // Use the stored pageSize
        onChange: handleTableChange, // Capture pagination changes
      }}
    />
  );
};
