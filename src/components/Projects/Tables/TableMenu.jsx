import { Menu, message, Modal, notification } from 'antd';
import { MoreOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useContext, useEffect, useState } from 'react';
import { EditVariable } from './EditVariable';
import { myContext } from '../../../App';
import { EditMappingsTableModal } from './EditMappingsTableModal';

export const TableMenu = ({
  tableData,
  table,
  setTable,
  form,
  loading,
  setLoading,
  mapping,
  editMappings,
  setEditMappings,
  setGetMappings,
  setMapping,
}) => {
  const { confirm } = Modal;
  const { vocabUrl } = useContext(myContext);
  const { variable } = tableData;

  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    if (deleteRow) {
      showConfirm();
    }
  }, [deleteRow]);

  const showEditMappings =
    mapping?.length > 0 &&
    mapping?.some(m => m?.code === variable.code && m?.mappings?.length > 0);

  const handleVarDelete = varName => {
    fetch(`${vocabUrl}/Table/${table.id}/variable/${varName}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (res.ok) {
          return res.json().then(data => {
            message.success('Variable deleted successfully.');
          });
        } else {
          notification.error({
            message: 'Error',
            description: 'An error occurred deleting the variable.',
          });
        }
      })
      .then(() => {
        return fetch(`${vocabUrl}/Table/${table.id}`);
      })
      .then(res => {
        if (res.ok) {
          return res.json().then(data => {
            setTable(data);
          });
        } else {
          notification.error({
            message: 'Error',
            description: 'An error occurred loading the Table.',
          });
        }
      });
  };

  const showConfirm = () => {
    confirm({
      className: 'delete_table_confirm',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content: (
        <>
          <div>Are you sure you want to delete variable {tableData.name}? </div>
        </>
      ),
      onOk() {
        handleVarDelete(tableData.name);
      },
      onCancel() {
        setDeleteRow(false);
        setSelectedKey(null);
      },
    });
  };

  const items = [
    {
      key: 'main-menu',
      icon: <MoreOutlined style={{ fontSize: '20px' }} />,
      children: [
        { key: 1, label: 'Edit' },
        { key: 2, label: 'Delete' },
        { key: 3, label: showEditMappings ? 'Edit Mappings' : 'Get Mappings' },
      ],
    },
  ];

  const onClick = ({ key }) => {
    setSelectedKey(key);
    switch (key) {
      case '1':
        return setEditRow(tableData.key);
      case '2':
        return setDeleteRow(true);
      case '3':
        return showEditMappings
          ? setEditMappings(variable)
          : setGetMappings(variable);
    }
  };

  return (
    <>
      <div className="edit_delete_buttons">
        <Menu
          items={items}
          onClick={onClick}
          selectedKeys={[selectedKey]}
          mode="horizontal"
        />
      </div>
      <EditVariable
        editRow={editRow}
        setEditRow={setEditRow}
        table={table}
        setTable={setTable}
        tableData={tableData}
        form={form}
        loading={loading}
        setLoading={setLoading}
        setSelectedKey={setSelectedKey}
      />
    </>
  );
};
