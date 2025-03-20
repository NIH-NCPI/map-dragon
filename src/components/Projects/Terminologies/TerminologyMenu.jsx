import { Menu, message, Modal, notification } from 'antd';
import { MoreOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { EditCode } from './EditCode';
import { ShowHistory } from '../../Manager/ShowHistory';
import { AssignMappings } from '../../Manager/MappingsFunctions/AssignMappings';
import { MappingContext } from '../../../Contexts/MappingContext';
import { RequiredLogin } from '../../Auth/RequiredLogin';
import { uriEncoded } from '../../Manager/Utility';

export const TerminologyMenu = ({
  tableData,
  terminology,
  setTerminology,
  form,
  loading,
  setLoading,
  mapping,
  setEditMappings,
  setGetMappings,
  prefTerminologies,
}) => {
  const { confirm } = Modal;
  const { vocabUrl, selectedKey, setSelectedKey, user } = useContext(myContext);
  const { assignMappings, setAssignMappings } = useContext(MappingContext);
  const { item } = tableData;
  const [deleteRow, setDeleteRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [showHistory, setShowHistory] = useState(null);

  // Login functions for each case in the dropdown menu with different props passed depending on selection

  const passEdit = () => {
    setEditRow(tableData.key);
  };
  const loginEdit = RequiredLogin({ handleSuccess: passEdit });

  const passDelete = () => {
    setDeleteRow(true);
  };
  const loginDelete = RequiredLogin({ handleSuccess: passDelete });

  const passAssignMappings = () => {
    setAssignMappings(tableData.key);
  };
  const loginAssignMappings = RequiredLogin({
    handleSuccess: passAssignMappings,
  });

  const passEditMappings = () => {
    setEditMappings(item);
  };
  const loginEditMappings = RequiredLogin({ handleSuccess: passEditMappings });

  const passGetMappings = () => {
    setGetMappings(item);
  };
  const loginGetMappings = RequiredLogin({ handleSuccess: passGetMappings });

  // Opens the delete dialog box when Delete is selected in the menu
  useEffect(() => {
    if (deleteRow) {
      showConfirm();
    }
  }, [deleteRow]);

  // Deletes individual code
  const handleVarDelete = varName => {
    fetch(
      `${vocabUrl}/Terminology/${terminology.id}/code/${uriEncoded(varName)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ editor: user.email }),
      }
    )
      .then(res => {
        if (res.ok) {
          return res.json().then(data => {
            message.success('Code deleted successfully.');
            setSelectedKey(null);
          });
        } else {
          notification.error({
            message: 'Error',
            description: 'An error occurred deleting the code.',
          });
        }
      })
      .then(() => {
        return fetch(`${vocabUrl}/Terminology/${terminology.id}`);
      })
      .then(res => {
        if (res.ok) {
          return res.json().then(data => {
            setTerminology(data);
          });
        } else {
          notification.error({
            message: 'Error',
            description: 'An error occurred loading the Terminology.',
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
          <div>Are you sure you want to delete code {tableData.code}? </div>
        </>
      ),
      onOk() {
        handleVarDelete(tableData.code);
      },
      onCancel() {
        setDeleteRow(false);
        setSelectedKey(null);
      },
    });
  };

  // Matches the code in the tableData to the code in the mappings to see if a code has mappings
  const showEditMappings =
    mapping?.length > 0 &&
    mapping?.some(m => {
      return m?.code === item?.code && m?.mappings?.length > 0;
    });

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
          label:
            prefTerminologies?.length > 0 && !showEditMappings
              ? 'Assign Mappings'
              : showEditMappings
              ? 'Mappings'
              : 'Get Mappings',
        },
        {
          key: `${tableData.key}-4`,
          label: 'History',
        },
      ],
    },
  ];

  // onClick function for Menu.
  // If a user is not logged in, the login screen is triggered

  const onClick = obj => {
    const key = obj.key;
    setSelectedKey(key);
    switch (key) {
      case `${tableData.key}-1`:
        return user ? setEditRow(tableData.key) : loginEdit();
      case `${tableData.key}-2`:
        return user ? setDeleteRow(true) : loginDelete();
      case `${tableData.key}-3`:
        return prefTerminologies.length > 0 && !showEditMappings
          ? user
            ? setAssignMappings(tableData.key)
            : loginAssignMappings()
          : showEditMappings
          ? // If mappings exist for a code, sets editMappings to the code and opens EditMappingsTableModal in turn
            user
            ? setEditMappings(item)
            : loginEditMappings()
          : // If mappings do not exist for a code, sets getMappings to the code and opens GetMappingsModal in turn
          user
          ? setGetMappings(item)
          : loginGetMappings();
      case `${tableData.key}-4`:
        return setShowHistory(tableData.key);
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

      <EditCode
        editRow={editRow}
        setEditRow={setEditRow}
        terminology={terminology}
        setTerminology={setTerminology}
        tableData={tableData}
        form={form}
        loading={loading}
        setLoading={setLoading}
        setSelectedKey={setSelectedKey}
      />
      <ShowHistory
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        component={terminology}
        componentName="Terminology"
        tableData={tableData}
        setSelectedKey={setSelectedKey}
        code={tableData.code}
      />
      <AssignMappings
        tableData={tableData}
        setSelectedKey={setSelectedKey}
        terminology={terminology}
        assignMappings={assignMappings}
        setAssignMappings={setAssignMappings}
      />
    </>
  );
};
