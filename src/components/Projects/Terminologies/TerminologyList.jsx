import { Button, Input, Space, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Link, useNavigate } from 'react-router-dom';
import { getAll } from '../../Manager/FetchManager';
import { Spinner } from '../../Manager/Spinner';

export const TerminologyList = () => {
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState([]);
  const { vocabUrl } = useContext(myContext);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getAll(vocabUrl, 'Terminology', navigate)
      .then(data => {
        setTerms(data);
        // if (data.length > 0) {
        //   setActive(data[0]?.api_id);
        // }
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      title: 'Terminology',
      dataIndex: 'name',
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search Terminology`}
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
        record?.name?.props.children
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        record?.description
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase()),
      filterIcon: filtered => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      width: 400,
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
  ];

  const dataSource = terms.map((item, i) => ({
    key: i,
    name: <Link to={`/Terminology/${item.id}`}>{item.name}</Link>,
    description: item.description,
  }));
  return loading ? (
    <Spinner />
  ) : (
    <div className="terminology_container">
      <h2>Terminology Index</h2>
      <Table columns={columns} dataSource={dataSource} />
    </div>
  );
};
