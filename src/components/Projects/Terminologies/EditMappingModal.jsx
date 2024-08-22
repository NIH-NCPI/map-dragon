import {
  Button,
  Checkbox,
  Form,
  message,
  Modal,
  notification,
  Tooltip,
} from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { ModalSpinner } from '../../Manager/Spinner';
import { MappingSearch } from '../../Manager/MappingsFunctions/MappingSearch';
import { ResetMappings } from './ResetMappings';
import { MappingReset } from '../../Manager/MappingsFunctions/MappingReset';
import { ellipsisString, systemsMatch } from '../../Manager/Utilitiy';
import { getById } from '../../Manager/FetchManager';

export const EditMappingsModal = ({
  editMappings,
  setEditMappings,
  terminologyId,
  setMapping,
}) => {
  const [form] = Form.useForm();
  const [termMappings, setTermMappings] = useState([]);
  const [options, setOptions] = useState([]);
  const { vocabUrl, setSelectedKey, user } = useContext(myContext);
  const [loading, setLoading] = useState(false);
  const [reset, setReset] = useState(false);
  const [mappingsForSearch, setMappingsForSearch] = useState([]);
  const [editSearch, setEditSearch] = useState(false);

  useEffect(() => {
    fetchMappings();
  }, [editMappings]);

  const clearData = () => {
    setTermMappings([]);
    setOptions([]);
    setSelectedKey(null);
  };

  const fetchMappings = () => {
    /* The terminology code was passed through the editMappings prop.
    If there is a code, the mappings for the code in the terminology are fetched.
    */
    if (editMappings) {
      setLoading(true);
      return fetch(
        `${vocabUrl}/Terminology/${terminologyId}/mapping/${editMappings.code}`,
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
            options.push({ value: val, label: editMappingsLabel(m, index) });
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

  // The label for the checkbox for each mapping. Displays JSX to show the display and code.
  // The description field is commented out to be integrated when there is API support.
  const editMappingsLabel = (item, index) => {
    return (
      <>
        <div key={index} className="modal_search_result">
          <div>
            <div className="modal_term_ontology">
              <div>
                <b>{item?.display}</b>
              </div>
              <div>
                {/* <a href={item.iri} target="_blank"> */}
                {item?.code}
                {/* </a> */}
              </div>
            </div>
            <div>
              {item?.description?.length > 100 ? (
                <Tooltip
                  title={item?.description}
                  placement="topRight"
                  mouseEnterDelay={0.5}
                >
                  {ellipsisString(item?.description, '100')}
                </Tooltip>
              ) : (
                ellipsisString(item?.description, '100')
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  // Function to send a PUT call to update the mappings.
  // Each mapping in the mappings array being edited is JSON.parsed and mappings are turned into objects in the mappings array.
  const updateMappings = values => {
    const mappingsDTO = {
      mappings: values?.mappings?.map(v => JSON.parse(v)) ?? [],
      editor: user.email,
    };
    fetch(
      `${vocabUrl}/Terminology/${terminologyId}/mapping/${editMappings.code}`,
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

  // Function to send a PUT call to update the mappings after code name change.
  // The existing and new mappings are JSON.parsed combined into one mappings array to be passed into the body of the PUT call.
  const editUpdatedMappings = values => {
    const selectedMappings = values?.selected_mappings?.map(item => ({
      code: item.obo_id,
      display: item.label,
      description: item.description[0],
      system: systemsMatch(item.obo_id.split(':')[0]),
    }));
    const mappingsDTO = {
      mappings: [
        ...(values.existing_mappings?.map(v => JSON.parse(v)) ?? []),
        ...(selectedMappings ?? []),
      ],
      editor: user.email,
    };

    fetch(
      `${vocabUrl}/Terminology/${terminologyId}/mapping/${editMappings.code}`,
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
            {
              /* Performs the updateMappings PUT call on 'Save' button click */
            }
            editSearch || reset
              ? editUpdatedMappings(values)
              : updateMappings(values);
            clearData();
            form.resetFields();
            setEditMappings(null);
            setReset(false);
            setEditSearch(false);
          })
          .then(data => setMapping(data));
      }}
      onCancel={() => {
        clearData();
        form.resetFields();
        setEditMappings(null);
        setReset(false);
        setEditSearch(false);
        reset &&
          getById(vocabUrl, 'Terminology', `${terminologyId}/mapping`).then(
            data => setMapping(data.codes)
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
                  <ResetMappings
                    terminologyId={terminologyId}
                    editMappings={editMappings}
                    setReset={setReset}
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
    >
      {loading ? (
        <ModalSpinner />
      ) : !reset && !editSearch ? (
        <>
          {/* If reset is false, the mappings for the code are displayed with checkboxes */}
          <div className="modal_search_results_header">
            <h3>
              Mappings for:{' '}
              {editMappings?.display
                ? editMappings.display
                : editMappings?.code}
            </h3>
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
      ) : // If reset or editSearch is true the MappingSearch modal opens to perform the search for the terminology code
      editSearch ? (
        <MappingSearch
          editMappings={editMappings}
          setEditMappings={setEditMappings}
          mappingsForSearch={mappingsForSearch}
          form={form}
          reset={reset}
          onClose={form.resetFields}
          searchProp={
            editMappings?.display ? editMappings.display : editMappings?.code
          }
        />
      ) : (
        reset && (
          <MappingReset
            searchProp={
              editMappings?.display ? editMappings.display : editMappings?.code
            }
            setEditMappings={setEditMappings}
            mappingsForSearch={mappingsForSearch}
            form={form}
            reset={reset}
            onClose={form.resetFields}
          />
        )
      )}
    </Modal>
  );
};
