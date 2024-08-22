import { Button, Modal, Table } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { getProvenanceByCode } from './FetchManager';
import { myContext } from '../../App';
import { ModalSpinner } from './Spinner';

export const ShowHistory = ({
  showHistory,
  setShowHistory,
  tableData,
  component,
  componentName,
  code,
  setSelectedKey,
}) => {
  const { vocabUrl } = useContext(myContext);
  const [provData, setProvData] = useState([]);
  const [loading, setLoading] = useState(true);

  // If the showHistory key matches the key of the row clicked, the provenance data is fetched
  useEffect(() => {
    if (showHistory === tableData.key) {
      setLoading(true);
      getProvenanceByCode(vocabUrl, componentName, component.id, tableData.code)
        .then(data => {
          setProvData(data.provenance[Object.keys(data?.provenance)[0]]);
        })
        .finally(() => setLoading(false));
    }
  }, [showHistory]);

  // If there are multiple mappings, splits the list by the commas and displays in a column
  const valuesRender = text => {
    if (!text) return null;
    return text
      .split(',')
      .map((item, index) => <div key={index}>{item.trim()}</div>);
  };

  const columns = [
    {
      title: 'Time Stamp (UTC)',
      dataIndex: 'timestamp',
      width: 100,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 100,
    },
    {
      title: 'Old Value',
      dataIndex: 'old_value',
      width: 100,
      render: valuesRender,
    },
    {
      title: 'New Value',
      dataIndex: 'new_value',
      width: 100,
      render: valuesRender,
    },
    {
      title: 'Editor',
      dataIndex: 'editor',
      width: 100,
    },
  ];

  const handleOk = () => {
    setSelectedKey(null);
    setShowHistory('');
  };

  const dataSource =
    provData?.changes?.map((prov, index) => ({
      key: index,
      timestamp: prov.timestamp,
      action: prov.action,
      old_value: prov.old_value,
      new_value: prov.new_value,
      editor: prov.editor,
    })) ?? [];
  return (
    showHistory === tableData.key && (
      <Modal
        open={showHistory === tableData.key}
        width={'70%'}
        onOk={handleOk}
        closable={false}
        destroyOnClose={true}
        maskClosable={true}
        footer={[
          <Button type="primary" onClick={handleOk}>
            OK
          </Button>,
        ]}
      >
        {loading ? (
          <ModalSpinner />
        ) : (
          <>
            <div>
              <h4>{code}</h4>
            </div>

            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              size="small"
            />
          </>
        )}
      </Modal>
    )
  );
};
