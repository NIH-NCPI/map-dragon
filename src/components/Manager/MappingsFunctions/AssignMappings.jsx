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
  const [terminologyToMap, setTerminologyToMap] = useState([]);

  const navigate = useNavigate();

  const onClose = () => {
    setAssignMappings(false);
    setSelectedKey(null);
  };

  const fetchPromises = () =>
    prefTerminologies.map(pref =>
      fetch(`${vocabUrl}/${pref?.reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => {
        if (!res.ok) {
          return res.json().then(error => {
            throw new Error(error);
          });
        }
        return res.json();
      })
    );
  useEffect(() => {
    if (assignMappings === tableData.key) {
      console.log(
        'assignMappings:',
        assignMappings,
        'tableData.key:',
        tableData.key
      );
      setLoading(true);
      fetchPromises();
      Promise.all(fetchPromises)
        .then(data => {
          setTerminologyToMap(data);
        })
        // .catch(error => {
        //   notification.error({
        //     message: 'Error',
        //     description: 'An error occurred loading preferred terminologies.',
        //   });
        // })
        .finally(() => setLoading(false));
    }
  }, [assignMappings, tableData.key]);

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
