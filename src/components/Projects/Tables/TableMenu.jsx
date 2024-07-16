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
}) => {
  const { confirm } = Modal;
  const { vocabUrl } = useContext(myContext);

  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);

  useEffect(() => {
    if (deleteRow) {
      showConfirm();
    }
  }, [deleteRow]);

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
          <div>Are you sure you want to delete this row? </div>
        </>
      ),
      onOk() {
        handleVarDelete(tableData.name);
      },
      onCancel() {
        setDeleteRow(false);
      },
    });
  };

  const items = [
    {
      key: 'main-menu',
      icon: <MoreOutlined />,
      children: [
        { key: 1, label: 'Edit' },
        { key: 2, label: 'Delete' },
        { key: 3, label: 'Mappings' },
      ],
    },
  ];

  const onClick = ({ key }) => {
    switch (key) {
      case '0':
        return setEdit(true);
      case '1':
        return setEditRow(true);
      case '2':
        return setDeleteRow(true);
    }
  };

  return <Menu items={items} onClick={onClick} mode="horizontal" />;
};
