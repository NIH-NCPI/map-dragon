import { useContext, useEffect, useState } from 'react';
import { Form, message, Modal, notification } from 'antd';
import { AssignMappingsCheckboxes } from '../../Manager/MappingsFunctions/AssignMappingsCheckboxes';
import { myContext } from '../../../App';
import { SearchContext } from '../../../Contexts/SearchContext';
import { MappingContext } from '../../../Contexts/MappingContext';
import { ModalSpinner } from '../../Manager/Spinner';
import { ontologyFilterCodeSubmit } from '../../Manager/FetchManager';

export const AssignMappingsViaButton = ({
  assignMappingsViaButton,
  setAssignMappingsViaButton,
  terminology,
}) => {
  const [form] = Form.useForm();

  const { vocabUrl, user } = useContext(myContext);
  const {
    prefTerminologies,
    setApiResults,
    preferenceType,
    prefTypeKey,
    apiPreferencesCode,
  } = useContext(SearchContext);
  const { setMapping, idsForSelect, setIdsForSelect } =
    useContext(MappingContext);
  const [terminologiesToMap, setTerminologiesToMap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mappingProp, setMappingProp] = useState('');
  const [selectedBoxes, setSelectedBoxes] = useState([]);

  const onClose = () => {
    setApiResults([]);
    setSelectedBoxes([]);
    setIdsForSelect([]);
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
      mapping_relationship: idsForSelect[item.obo_id || item.code],
    }));
    const mappingsDTO = {
      mappings: selectedMappings,
      editor: user.email,
    };

    fetch(
      `${vocabUrl}/Terminology/${terminology.id}/mapping/${assignMappingsViaButton.code}?user_input=true&user=${user?.email}`,
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
    ontologyFilterCodeSubmit(
      apiPreferencesCode,
      preferenceType,
      prefTypeKey,
      assignMappingsViaButton?.code,
      vocabUrl,
      null,
      terminology
    );
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
          setTerminologiesToMap={setTerminologiesToMap}
          selectedBoxes={selectedBoxes}
          setSelectedBoxes={setSelectedBoxes}
          mappingProp={
            assignMappingsViaButton?.display
              ? assignMappingsViaButton.display
              : assignMappingsViaButton?.code
          }
          terminology={terminology}
        />
      )}
    </Modal>
  );
};
