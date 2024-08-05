import { Menu, message, Modal, notification } from 'antd';
import { MoreOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useContext, useEffect, useState } from 'react';
import { EditVariable } from './EditVariable';
import { myContext } from '../../../App';

export const TableMenu = ({
  tableData,
  table,
  setTable,
  form,
  loading,
  setLoading,
  mapping,
  setEditMappings,
  setGetMappings,
}) => {
  const { confirm } = Modal;
  const { vocabUrl, selectedKey, setSelectedKey, user } = useContext(myContext);
  const { variable } = tableData;
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [showHistory, setShowHistory] = useState(null);

  // Opens the delete dialog box when Delete is selected in the menu
  useEffect(() => {
    if (deleteRow) {
      showConfirm();
    }
  }, [deleteRow]);

  // Deletes individual variable
  const handleVarDelete = varName => {
    fetch(`${vocabUrl}/Table/${table.id}/variable/${varName}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ editor: user.email }),
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

  // Delete dialog box
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

  // Matches the code in the tableData to the code in the mappings to see if a variable has mappings
  const showEditMappings =
    mapping?.length > 0 &&
    mapping?.some(m => m?.code === variable.code && m?.mappings?.length > 0);

  // Menu items
  const items = [
    {
      key: 'main-menu',
      icon: <MoreOutlined style={{ fontSize: '20px' }} />,
      children: [
        { key: `${tableData.key}-1`, label: 'Edit' },
        { key: `${tableData.key}-2`, label: 'Delete' },
        {
          key: `${tableData.key}-3`,
          label: showEditMappings ? 'Mappings' : 'Get Mappings',
        },
        {
          key: `${tableData.key}-4`,
          label: 'History',
        },
      ],
    },
  ];

  // onClick function for Menu.
  const onClick = obj => {
    const key = obj.key;
    setSelectedKey(key);
    switch (key) {
      case `${tableData.key}-1`:
        return setEditRow(tableData.key);
      case `${tableData.key}-2`:
        return setDeleteRow(true);
      case `${tableData.key}-3`:
        return showEditMappings
          ? // If mappings exist for a variable, sets editMappings to the variable and opens EditMappingsTableModal in turn
            setEditMappings(variable)
          : // If mappings do not exist for a variable, sets getMappings to the variable and opens GetMappingsModal in turn
            setGetMappings(variable);
      case `${tableData.key}-4`:
        return setShowHistory(true);
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
