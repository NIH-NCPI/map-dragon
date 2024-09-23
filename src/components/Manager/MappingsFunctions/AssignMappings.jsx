import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Form, Modal, notification } from 'antd';
import { MappingContext } from '../../../MappingContext';
import { getById } from '../FetchManager';
import { useNavigate } from 'react-router-dom';
import { AssignMappingsCheckboxes } from './AssignMappingsCheckboxes';
import { ModalSpinner } from '../Spinner';

export const AssignMappings = ({
  form,
  setSelectedKey,
  terminology,
  tableData,
  assignMappings,
  setAssignMappings,
}) => {
  const { vocabUrl, prefTerminologies, setPrefTerminologies } =
    useContext(myContext);
  const [terminologiesToMap, setTerminologiesToMap] = useState([]);
  const [loading, setLoading] = useState(false);

  const onClose = () => {
    setAssignMappings(false);
    setSelectedKey(null);
  };

  const fetchTerminologies = () => {
    setLoading(true);
    const fetchPromises = prefTerminologies.map(pref =>
      fetch(`${vocabUrl}/${pref?.reference}`).then(response => response.json())
    );

    Promise.all(fetchPromises)
      .then(results => {
        // Once all fetch calls are resolved, set the combined data
        setTerminologiesToMap(results);
      })
      .catch(error => {
        notification.error({
          message: 'Error',
          description: 'An error occurred. Please try again.',
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (assignMappings === tableData.key) fetchTerminologies();
  }, [assignMappings]);

  return (
    assignMappings === tableData.key && (
      <Modal
        open={assignMappings === tableData.key}
        width={'60%'}
        onOk={() => {
          form.validateFields().then(values => {
            //   handleSubmit(values);
            onClose();
          });
        }}
        onCancel={() => {
          form.resetFields();
          onClose();
        }}
        styles={{
          body: {
            minHeight: '55vh',
            maxHeight: '55vh',
            overflowY: 'auto',
          },
        }}
        closeIcon={false}
        maskClosable={false}
        destroyOnClose={true}
        cancelButtonProps={{ disabled: loading }}
        okButtonProps={{ disabled: loading }}
      >
        {loading ? (
          <ModalSpinner />
        ) : (
          <AssignMappingsCheckboxes terminologiesToMap={terminologiesToMap} />
        )}
      </Modal>
    )
  );
};
