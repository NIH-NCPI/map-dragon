import { Button, Input, notification, Space, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useContext, useEffect, useRef, useState } from 'react';
import { myContext } from '../../../App';
import { Link, useNavigate } from 'react-router-dom';
import { getAll } from '../../Manager/FetchManager';
import { Spinner } from '../../Manager/Spinner';
import { AddTerminology } from './AddTerminology';
import { DeleteOutlined } from '@ant-design/icons';
import { DeleteTerminology } from './DeleteTerminology';

export const TerminologyList = () => {
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState([]);
  const [filter, setFilter] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [pageSize, setPageSize] = useState(
    parseInt(localStorage.getItem('pageSize'), 10) || 10
  );
  const { vocabUrl } = useContext(myContext);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Terminology Index - Map Dragon';
  }, []);

  const inputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    getAll(vocabUrl, 'Terminology', navigate)
      .then(data => {
        setTerms(data);
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred loading terminologies.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
    localStorage.setItem('pageSize', pageSize);
  }, [pageSize]);

  const terminologyTitle = () => {
    return (
      <div className="terminology_filter">
        <div>Terminology</div>
        {filter?.length > 0 ? <div>Filtering by '{filter}'</div> : ''}
      </div>
    );
  };

  const nameLink = item => (
    <Link to={`/Terminology/${item.id}`}>
      {item.name ? item.name : item.id}
    </Link>
  );
  const handleTableChange = (current, size) => {
    setPageSize(size);
  };

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
              setFilter(e.target.value ? [e.target.value] : []); // sets filter to the input text to display at top of table
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
    {
      title: '',
      dataIndex: 'delete_column',
      width: 10,
    },
  ];

  const dataSource = terms.map((item, i) => ({
    key: i,
    name: nameLink(item),
    description: item.description,
    // Sets deleteId to the row's (i.e. terminology's) is
    delete_column: (
      <DeleteOutlined
        onClick={() => {
          setDeleteId(item.id);
        }}
      />
    ),
  }));

  return loading ? (
    <Spinner />
  ) : (
    <>
      <div className="terminology_container">
        <h2>Terminology Index</h2>
        <AddTerminology />
        <Table
          showSizeChanger={true}
          columns={columns}
          dataSource={dataSource}
          getPopupContainer={trigger => trigger.parentNode}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '30'],
            pageSize: pageSize, // Use the stored pageSize
            onChange: handleTableChange, // Capture pagination changes
          }}
        />
      </div>
      <DeleteTerminology
        setTerms={setTerms}
        deleteId={deleteId}
        setDeleteId={setDeleteId}
      />
    </>
  );
};
