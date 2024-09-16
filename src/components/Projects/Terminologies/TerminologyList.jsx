import { Button, Input, Space, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useContext, useEffect, useRef, useState } from 'react';
import { myContext } from '../../../App';
import { Link, useNavigate } from 'react-router-dom';
import { getAll } from '../../Manager/FetchManager';
import { Spinner } from '../../Manager/Spinner';
import { AddTerminology } from './AddTerminology';

export const TerminologyList = () => {
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState([]);
  const [filter, setFilter] = useState(null);

  const { vocabUrl } = useContext(myContext);

  const navigate = useNavigate();

  const inputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    getAll(vocabUrl, 'Terminology', navigate)
      .then(data => {
        setTerms(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const terminologyTitle = () => {
    return (
      <div className="terminology_filter">
        <div>Terminology</div>
        {filter?.length > 0 ? <div>Filtering by '{filter}'</div> : ''}
      </div>
    );
  };

  const nameLink = item => (
    <Link to={`/Terminology/${item.id}`}>{item.name}</Link>
  );

  const columns = [
    {
      title: terminologyTitle(),
      dataIndex: 'name',
      // Filters table by keystroke
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={inputRef}
            placeholder={`Search Terminology`}
            value={selectedKeys[0]}
            onChange={e => {
              setSelectedKeys(e.target.value ? [e.target.value] : []);
              setFilter(e.target.value ? [e.target.value] : []); // sets filter to filter text to display at top of table
              confirm({ closeDropdown: false });
            }}
            style={{ display: 'block', marginBottom: 8 }}
            autoFocus
          />
          <Space>
            <Button
              onClick={() => {
                clearFilters();
                setSelectedKeys([]);
                setFilter('');
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
        // Searches both the name and description property for keystrokes to filter
        record?.name?.props?.children
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        record?.description
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase()),
      filterIcon: filtered => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilterDropdownOpenChange: open => {
        if (open) {
          setTimeout(() => {
            inputRef.current?.focus(); // Focus cursor on search input
          }, 100); // Small delay to ensure input is rendered
        }
      },
      width: 400,
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
  ];

  const dataSource = terms.map((item, i) => ({
    key: i,
    name: nameLink(item),
    description: item.description,
  }));

  return loading ? (
    <Spinner />
  ) : (
    <div className="terminology_container">
      <h2>Terminology Index</h2>
      <AddTerminology />
      <Table
        columns={columns}
        dataSource={dataSource}
        getPopupContainer={trigger => trigger.parentNode}
      />
    </div>
  );
};
