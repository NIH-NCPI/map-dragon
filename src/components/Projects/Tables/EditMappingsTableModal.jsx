import { Button, Checkbox, Form, message, Modal, notification } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { ModalSpinner } from '../../Manager/Spinner';
import { MappingContext } from '../../../Contexts/MappingContext';
import { MappingSearch } from '../../Manager/MappingsFunctions/MappingSearch';
import { ResetTableMappings } from './ResetTableMappings';
import { systemsMatch } from '../../Manager/Utilitiy';
import { getById } from '../../Manager/FetchManager';
import { SearchContext } from '../../../Contexts/SearchContext';
import { OntologyFilterCodeSubmit } from '../../Manager/MappingsFunctions/OntologyFilterCodeSubmit';
import { EditMappingsLabel } from '../../Manager/MappingsFunctions/EditMappingsLabel';

export const EditMappingsTableModal = ({
  editMappings,
  setEditMappings,
  tableId,
  setMapping,
  table,
}) => {
  const [form] = Form.useForm();
  const [termMappings, setTermMappings] = useState([]);
  const [options, setOptions] = useState([]);
  const { vocabUrl, setSelectedKey, user } = useContext(myContext);
  const [loading, setLoading] = useState(false);
  const [reset, setReset] = useState(false);
  const [mappingsForSearch, setMappingsForSearch] = useState([]);
  const [editSearch, setEditSearch] = useState(false);
  const {
    setSelectedMappings,
    setDisplaySelectedMappings,
    setShowOptions,
    idsForSelect,
  } = useContext(MappingContext);
  const {
    apiPreferencesCode,
    setApiPreferencesCode,
    preferenceType,
    prefTypeKey,
    ontologyApis,
  } = useContext(SearchContext);

  useEffect(() => {
    fetchMappings();
  }, [editMappings]);

  const onClose = () => {
    setEditMappings(null);
    setTermMappings([]);
    setOptions([]);
    setReset(false);
    setEditSearch(false);
    setSelectedKey(null);
    setApiPreferencesCode(undefined);
    setShowOptions(false);
  };

  const fetchMappings = () => {
    /* The table code was passed through the editMappings prop.
    If there is a code, the mappings for the code in the table are fetched.
    */
    if (editMappings) {
      setLoading(true);
      return fetch(
        `${vocabUrl}/Table/${tableId}/mapping/${editMappings.code}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
        .then(res => {
          if (res.ok) {
            return res.json();
          }
        })
        .then(data => {
          setMappingsForSearch(data.mappings); // will be passed to MappingSearch.jsx to check existing mappings by default
          // If the mappings array length for the code is < 1, undefined is returned
          if (data.mappings.length < 1) {
            return undefined;
          }
          // array of mapped codes used to check default values in checkboxes
          const mappings = [];
          // array of mapped codes used to display the the checkboxes and build data structure of object
          const options = [];

          data.mappings.forEach((m, index) => {
            {
              /* For each mapping in the mappings array, JSON stringify the object below of code, display, and system. 
          The API does not yet support the description field, so it is commented out for easy future integration
          */
            }
            const val = JSON.stringify({
              code: m.code,
              display: m.display,
              description: m.description,
              system: m?.system,
            });

            mappings.push(val); // For each mapping in the mappings array, push the stringified object above to the mappings array.
            // For each mapping in the mappings array, push the stringified object above to the options array
            // as the value for the value field for the ant.design checkbox. The label for the checkbox is returned in edditMappingsLabel function.
            options.push({
              value: val,
              label: <EditMappingsLabel item={m} index={index} />,
              // label: editMappingsLabel(m, index),
            });
          });
          // termMappings are set to the mappings array. Options are set to the options array.
          setTermMappings(mappings);
          setOptions(options);
        })
        .catch(error => {
          if (error) {
            notification.error({
              message: 'Error',
              description: 'An error occurred. Please try again.',
            });
          }
          return error;
        })
        .finally(() => setLoading(false));
    }
  };

  // Function to send a PUT call to update the mappings.
  // Each mapping in the mappings array being edited is JSON.parsed and turned into objects in the mappings array.
  const updateMappings = values => {
    setLoading(true);
    // If there are changes in the mapping relationship dropdown, the changes are matched to the code and added to the mapping object.
    const mappingsDTO = {
      mappings:
        values?.mappings?.map(v => {
          const parsedMapping = JSON.parse(v);
          if (idsForSelect[parsedMapping.code]) {
            parsedMapping.mapping_relationship =
              idsForSelect[parsedMapping.code];
          }

          return parsedMapping;
        }) ?? [],
      editor: user.email,
    };

    fetch(`${vocabUrl}/Table/${tableId}/mapping/${editMappings.code}`, {
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
        setEditMappings(null);
        form.resetFields();
        message.success('Mappings updated successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  };

  const mappingProp = editMappings?.code;
  // Function to send a PUT call to update the mappings after code name change.
  // The existing and new mappings are JSON.parsed and combined into one mappings array to be passed into the body of the PUT call.
  const editUpdatedMappings = values => {
    setLoading(true);
    const selectedMappings = values?.selected_mappings?.map(item => ({
      code: item.code,
      display: item.display,
      description: item.description,
      system:
        item.system || systemsMatch(item.obo_id.split(':')[0], ontologyApis),
      mapping_relationship: idsForSelect[item.code],
    }));
    const mappingsDTO = {
      mappings: [
        ...(values.existing_mappings?.map(v => {
          const parsedMapping = JSON.parse(v);
          if (idsForSelect[parsedMapping.code]) {
            parsedMapping.mapping_relationship =
              idsForSelect[parsedMapping.code];
          }

          return parsedMapping;
        }) ?? []),
        ...(selectedMappings ?? []),
      ],
      editor: user.email,
    };

    fetch(`${vocabUrl}/Table/${tableId}/mapping/${editMappings.code}`, {
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
        setEditMappings(null);
        form.resetFields();
        setMapping(data.codes);
        message.success('Mappings updated successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
    OntologyFilterCodeSubmit(
      apiPreferencesCode,
      preferenceType,
      prefTypeKey,
      mappingProp,
      vocabUrl,
      table
    );
  };

  return (
    <Modal
      // since the code is passed through editMappings, the '!!' forces it to be evaluated as a boolean.
      // if there is a code being passed, it evaluates to true and opens the modal.
      open={!!editMappings}
      width={'60%'}
      styles={{ body: { height: '60vh', overflowY: 'auto' } }}
      okText="Save"
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            editSearch || reset
              ? editUpdatedMappings(values)
              : updateMappings(values);
            onClose();
          })
          .then(data => {
            setMapping(data);
            setSelectedKey(null);
          });
      }}
      onCancel={() => {
        onClose();
        form.resetFields();
        setSelectedMappings([]);
        setDisplaySelectedMappings([]);
        reset &&
          getById(vocabUrl, 'Table', `${tableId}/mapping`).then(data =>
            setMapping(data.codes)
          );
      }}
      closeIcon={false}
      maskClosable={false}
      destroyOnClose={true}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          <div className={!reset ? 'footer_buttons' : 'save_button_only'}>
            {/* If reset and editSearch are false, the reset and edit buttons are displayed
            The reset button opens a modal to confirm mapping deletion, then the search is performed again
            in the MappingSearch modal below. The edit/add button sets editSearch to true and opens 
            the modal to perform the search in MappingSearch below. */}
            <div className="reset_edit_buttons">
              {!reset && !editSearch && (
                <>
                  <ResetTableMappings
                    tableId={tableId}
                    editMappings={editMappings}
                    setReset={resp => {
                      setReset(resp);
                      if (resp) {
                        setMappingsForSearch([]);
                      }
                    }}
                  />
                  <Button onClick={() => setEditSearch(true)}>
                    Edit / Add
                  </Button>
                </>
              )}
            </div>
            <div className="cancel_ok_buttons">
              <CancelBtn />
              <OkBtn />
            </div>
          </div>
        </>
      )}
      cancelButtonProps={{ disabled: loading }}
      okButtonProps={{ disabled: loading }}
    >
      {loading ? (
        <ModalSpinner />
      ) : !reset && !editSearch ? (
        <>
          {/* If reset is false, the mappings for the code are displayed with checkboxes */}
          <div className="modal_search_results_header">
            <h3>Mappings for: {editMappings?.name}</h3>
          </div>
          <Form form={form} layout="vertical" preserve={false}>
            <Form.Item
              name={['mappings']}
              valuePropName="value"
              // Each checkbox is checked by default. The user can uncheck a checkbox to remove a mapping by clicking the save button.
              initialValue={termMappings}
            >
              <Checkbox.Group className="mappings_checkbox" options={options} />
            </Form.Item>
          </Form>
        </>
      ) : (
        // If reset or editSearch is true the MappingSearch modal opens to perform the search for the table code

        <MappingSearch
          setEditMappings={setEditMappings}
          mappingsForSearch={mappingsForSearch}
          form={form}
          onClose={form.resetFields}
          searchProp={editMappings?.name}
          mappingDesc={editMappings?.description ?? 'No Description'}
          component={table}
          mappingProp={editMappings?.code}
          table={table}
        />
      )}
    </Modal>
  );
};
