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
  const [pageSize, setPageSize] = useState(10);

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

  // Ensures text is a string. If there are multiple changes, splits the list by the commas and displays in a column
  const valuesRender = text => {
    if (!text || typeof text !== 'string') return null;
    return text
      ?.split(',')
      .map((item, index) => <div key={index}>{item?.trim()}</div>);
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
    provData?.changes
      ?.map((prov, index) => {
        let [date, time] = prov.timestamp.split(' ');
        let [hour, minute, second] = time.split(':');

        const meridiem =
          second === undefined ? prov.timestamp.slice(-2) : second.slice(-2);
        if (meridiem === 'PM' && hour !== '12') {
          hour = parseInt(hour) + 12;
        }
        if (meridiem === 'AM' && hour === '12') {
          hour = '00';
        }

        if (second === undefined) {
          minute = minute.slice(0, 2);
        }
        if (second === undefined) {
          second = '00';
        }

        const formattedDate = `${date}T${hour}:${minute}:${second.slice(
          0,
          2
        )}.000Z`;

        return {
          key: index,
          timestamp: prov.timestamp,
          formattedDate,
          action: prov.action,
          old_value: prov.old_value,
          new_value: prov.new_value,
          editor: prov.editor,
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.formattedDate);
        const dateB = new Date(b.formattedDate);

        return dateB - dateA;
      }) ?? [];

  const handleTableChange = (current, size) => {
    setPageSize(size);
  };

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
            Close
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
              scroll={{
                x: 'max-content',
                y: 60 * 5,
              }}
              columns={columns}
              dataSource={dataSource}
              pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '30'],
                pageSize: pageSize, // Use the stored pageSize
                onChange: handleTableChange,
              }} // Capture pagination changes
              size="small"
            />
          </>
        )}
      </Modal>
    )
  );
};
