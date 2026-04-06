import { useContext, useEffect, useState } from 'react';
import { Form, message, Modal, notification } from 'antd';
import { AssignMappingsCheckboxes } from '../../Manager/MappingsFunctions/AssignMappingsCheckboxes';
import { myContext } from '../../../App';
import { SearchContext } from '../../../Contexts/SearchContext';
import { MappingContext } from '../../../Contexts/MappingContext';
import { ModalSpinner } from '../../Manager/Spinner';
import { ontologyFilterCodeSubmit } from '../../Manager/FetchManager';
import { uriEncoded } from '../../Manager/Utility';

export const AssignMappingsViaButton = ({
  assignMappingsViaButton,
  setAssignMappingsViaButton,
  component,
  componentString
}) => {
  const [form] = Form.useForm();

  const { vocabUrl, user } = useContext(myContext);
  const {
    prefTerminologies,
    setApiResults,
    preferenceType,
    prefTypeKey,
    apiPreferencesCode
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

  const handleSubmit = values => {
    setLoading(true);
    const selectedMappings = selectedBoxes?.map(item => ({
      code: item.code,
      display: item.display,
      description: Array.isArray(item.description)
        ? item.description?.map(d => d).join(',')
        : item.description,
      system: item.system,
      mapping_relationship: idsForSelect[item.code]
    }));
    const mappingsDTO = {
      mappings: selectedMappings,
      editor: user.email
    };

    fetch(
      `${vocabUrl}/${componentString}/${component.id}/mapping/${uriEncoded(
        assignMappingsViaButton?.code
      )}?user_input=true&user=${user?.email}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mappingsDTO)
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
        if (data) setMapping(data.codes);
        form.resetFields();
        setAssignMappingsViaButton(false);
        message.success('Changes saved successfully.');
      })
      .then(() =>
        ontologyFilterCodeSubmit(
          apiPreferencesCode,
          preferenceType,
          prefTypeKey,
          assignMappingsViaButton.code,
          vocabUrl,
          component,
          componentString,
          notification
        )
      )
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred saving the ontology preferences.'
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      open={!!assignMappingsViaButton}
      width={'70%'}
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
          overflowY: 'auto'
        }
      }}
      closeIcon={false}
      maskClosable={false}
      destroyOnHidden={true}
      cancelButtonProps={{ disabled: loading }}
      okButtonProps={{ disabled: loading }}
    >
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
        component={component}
        componentString={componentString}
        loading={loading}
      />
    </Modal>
  );
};
