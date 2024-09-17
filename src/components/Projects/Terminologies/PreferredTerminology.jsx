import { Button, Checkbox, Form, Input, Modal, Space, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useContext, useEffect, useRef, useState } from 'react';
import { getAll } from '../../Manager/FetchManager';
import { myContext } from '../../../App';
import { Link, useNavigate } from 'react-router-dom';

export const PreferredTerminology = () => {
  const [form] = Form.useForm();
  const { vocabUrl } = useContext(myContext);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState([]);
  const [filter, setFilter] = useState(null);

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
    <Link to={`/Terminology/${item.id}`} target="_blank">
      {item.name ? item.name : item.id}
    </Link>
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
  ];

  const dataSource = terms.map((item, i) => ({
    key: i,
    name: nameLink(item),
    description: item.description,
  }));

  return (
    <>
      <div className="add_row_button">
        <Button
          onClick={() => setOpen(true)}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          Select Terminology
        </Button>
      </div>
      <Modal
        // since the code is passed through editMappings, the '!!' forces it to be evaluated as a boolean.
        // if there is a code being passed, it evaluates to true and opens the modal.
        open={open}
        width={'60%'}
        onOk={() => {
          form.validateFields();
          setOpen(false);
        }}
        onCancel={() => {
          form.resetFields();
          setOpen(false);
        }}
        closeIcon={false}
        maskClosable={false}
        destroyOnClose={true}
        style={{
          top: 20,
        }}
      >
        <div className="modal_search_results_header">
          <h3>Terminologies</h3>
        </div>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name={['mappings']}
            valuePropName="value"
            // Each checkbox is checked by default. The user can uncheck a checkbox to remove a mapping by clicking the save button.
          >
            <Table
              columns={columns}
              dataSource={dataSource}
              getPopupContainer={trigger => trigger.parentNode}
              size="small"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
