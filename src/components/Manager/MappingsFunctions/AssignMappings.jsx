import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Form, Modal, notification } from 'antd';
import { MappingContext } from '../../../MappingContext';
import { getById } from '../FetchManager';
import { useNavigate } from 'react-router-dom';

export const AssignMappings = ({
  loading,
  setLoading,
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

  const navigate = useNavigate();

  const onClose = () => {
    setAssignMappings(false);
    setSelectedKey(null);
  };

  const fetchTerminologies = async () => {
    try {
      const fetchPromises = prefTerminologies.map(pref =>
        fetch(`${vocabUrl}/${pref?.reference}`).then(response =>
          response.json()
        )
      );

      const results = await Promise.all(fetchPromises);

      // Once all fetch calls are resolved, set the combined data
      setTerminologiesToMap(results);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'An error occurred. Please try again.',
      });
    }
  };
  console.log(terminologiesToMap);
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
        closeIcon={false}
        maskClosable={false}
        destroyOnClose={true}
        cancelButtonProps={{ disabled: loading }}
        okButtonProps={{ disabled: loading }}
      >
        poop
      </Modal>
    )
  );
};
