import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Form, message, Modal, notification } from 'antd';
import { AssignMappingsCheckboxes } from './AssignMappingsCheckboxes';
import { ModalSpinner } from '../Spinner';
import { MappingContext } from '../../../Contexts/MappingContext';
import { SearchContext } from '../../../Contexts/SearchContext';

export const AssignMappings = ({
  setSelectedKey,
  tableData,
  assignMappings,
  setAssignMappings,
  terminology,
}) => {
  const [form] = Form.useForm();

  const { vocabUrl, user } = useContext(myContext);
  const { prefTerminologies, setApiResults } = useContext(SearchContext);
  const { setMapping } = useContext(MappingContext);
  const [terminologiesToMap, setTerminologiesToMap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mappingProp, setMappingProp] = useState('');
  const [selectedBoxes, setSelectedBoxes] = useState([]);

  const onClose = () => {
    setSelectedKey(null);
    setMappingProp('');
    setApiResults([]);
  };
  const fetchTerminologies = () => {
    setLoading(true);
    const fetchPromises = prefTerminologies?.map(pref =>
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
    if (assignMappings === tableData.key) {
      fetchTerminologies();
      setMappingProp(tableData.code);
    }
  }, [assignMappings]);

  const handleSubmit = values => {
    setLoading(true);
    const selectedMappings = selectedBoxes?.map(item => ({
      code: item.code,
      display: item.display,
      description: Array.isArray(item.description)
        ? item.description[0]
        : item.description,
      system: item.system,
    }));
    const mappingsDTO = {
      mappings: selectedMappings,
      editor: user.email,
    };

    fetch(`${vocabUrl}/Terminology/${terminology.id}/mapping/${mappingProp}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mappingsDTO),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => {
        setMapping(data.codes);
        form.resetFields();
        setAssignMappings(false);
        message.success('Changes saved successfully.');
      })
      .finally(() => setLoading(false));
  };

  return (
    assignMappings === tableData.key && (
      <Modal
        open={assignMappings === tableData.key}
        width={'60%'}
        onOk={() => {
          form.validateFields().then(values => {
            handleSubmit(values);
            onClose();
          });
        }}
        onCancel={() => {
          form.resetFields();
          onClose();
          setAssignMappings(false);
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
          <AssignMappingsCheckboxes
            form={form}
            terminologiesToMap={terminologiesToMap}
            selectedBoxes={selectedBoxes}
            setSelectedBoxes={setSelectedBoxes}
            searchProp={
              tableData?.display ? tableData.display : tableData?.code
            }
          />
        )}
      </Modal>
    )
  );
};
