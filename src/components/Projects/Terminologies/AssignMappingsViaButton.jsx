import { useContext, useEffect, useState } from 'react';
import { Form, message, Modal, notification } from 'antd';
import { AssignMappingsCheckboxes } from '../../Manager/MappingsFunctions/AssignMappingsCheckboxes';
import { myContext } from '../../../App';
import { SearchContext } from '../../../Contexts/SearchContext';
import { MappingContext } from '../../../Contexts/MappingContext';
import { ModalSpinner } from '../../Manager/Spinner';

export const AssignMappingsViaButton = ({
  assignMappingsViaButton,
  setAssignMappingsViaButton,
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
    fetchTerminologies();
  }, [assignMappingsViaButton]);

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

    fetch(
      `${vocabUrl}/Terminology/${terminology.id}/mapping/${assignMappingsViaButton.code}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappingsDTO),
      }
    )
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
        setAssignMappingsViaButton(false);
        message.success('Changes saved successfully.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      open={!!assignMappingsViaButton}
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
        setAssignMappingsViaButton(false);
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
            assignMappingsViaButton?.display
              ? assignMappingsViaButton.display
              : assignMappingsViaButton?.code
          }
        />
      )}
    </Modal>
  );
};
