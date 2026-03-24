import { Form, message, Modal, notification } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { ModalSpinner } from '../../Manager/Spinner';
import { MappingContext } from '../../../Contexts/MappingContext';
import { MappingSearch } from '../../Manager/MappingsFunctions/MappingSearch';
import { ResetTableMappings } from './ResetTableMappings';
import { uriEncoded } from '../../Manager/Utility';
import { getById, ontologyFilterCodeSubmit } from '../../Manager/FetchManager';
import { SearchContext } from '../../../Contexts/SearchContext';

export const EditMappingsTableModal = ({
  editMappings,
  setEditMappings,
  setMapping,
  table,
  terminology
}) => {
  const [form] = Form.useForm();
  const { vocabUrl, setSelectedKey, user } = useContext(myContext);
  const [loading, setLoading] = useState(false);
  const [reset, setReset] = useState(false);
  const [mappingsForSearch, setMappingsForSearch] = useState([]);
  const [editSearch, setEditSearch] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);

  const {
    setSelectedMappings,
    setDisplaySelectedMappings,
    setShowOptions,
    idsForSelect,
    setIdsForSelect,
    existingMappings,
    selectedBoxes
  } = useContext(MappingContext);
  const {
    apiPreferencesCode,
    setApiPreferencesCode,
    preferenceType,
    prefTypeKey,
    setSelectedApi
  } = useContext(SearchContext);

  useEffect(() => {
    fetchMappings();
  }, [editMappings]);

  const onClose = () => {
    setEditMappings(null);
    // setTermMappings([]);
    // setOptions([]);
    setReset(false);
    setEditSearch(false);
    setSelectedKey(null);
    setApiPreferencesCode(undefined);
    setShowOptions(false);
    setSelectedApi(undefined);
  };

  const fetchMappings = () => {
    /* The table code was passed through the editMappings prop.
    If there is a code, the mappings for the code in the table are fetched.
    */
    if (editMappings) {
      setLoading(true);
      return fetch(
        `${vocabUrl}/${
          table
            ? `Table/${table.id}/mapping/${uriEncoded(editMappings.code)}`
            : `Terminology/${terminology.id}/mapping/${uriEncoded(editMappings.code)}`
        }`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
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
          // const options = [];

          data.mappings.forEach((m, index) => {
            {
              /* For each mapping in the mappings array, JSON stringify the object below of code, display, and system. 
          The API does not yet support the description field, so it is commented out for easy future integration
          */
            }
            const val = JSON.stringify({
              code: m.code,
              ftd_code: m.ftd_code,
              display: m.display,
              description: m.description,
              system: m?.system
            });

            mappings.push(val); // For each mapping in the mappings array, push the stringified object above to the mappings array.
          });
        })
        .catch(error => {
          if (error) {
            notification.error({
              message: 'Error',
              description: 'An error occurred. Please try again.'
            });
          }
          return error;
        })
        .finally(() => setLoading(false));
    }
  };

  const mappingProp = editMappings?.code;
  // Function to send a PUT call to update the mappings after code name change.
  // The existing and new mappings are JSON.parsed and combined into one mappings array to be passed into the body of the PUT call.
  const editUpdatedMappings = values => {
    setLoading(true);

    const selectedMappings = selectedBoxes?.map(item => ({
      code: item.code,
      display: item.display,
      description: item.description,
      system: item?.system,
      mapping_relationship: idsForSelect[item.code]
    }));

    const preexistingMappings = existingMappings?.map(item => {
      const mapping = {
        code: item.code,
        display: item.display,
        description: item.description,
        system: item?.system,
        mapping_relationship: item.mapping_relationship
      };

      if (Object.hasOwn(idsForSelect, mapping.code)) {
        mapping.mapping_relationship = idsForSelect[mapping.code];
      }
      return mapping;
    });
    const mappingsDTO = {
      mappings: [...(preexistingMappings ?? []), ...(selectedMappings ?? [])],
      editor: user.email
    };

    fetch(
      `${vocabUrl}/${
        table
          ? `Table/${table.id}/mapping/${uriEncoded(editMappings.code)}?user_input=True&user=${user?.email}`
          : `Terminology/${terminology.id}/mapping/${uriEncoded(editMappings.code)}?user_input=True&user=${user?.email}`
      }`,
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
        setMapping(data.codes);
        form.resetFields();
        setEditMappings(null);
        message.success('Mappings updated successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.'
          });
        }
        return error;
      })
      .then(() =>
        ontologyFilterCodeSubmit(
          apiPreferencesCode,
          preferenceType,
          prefTypeKey,
          mappingProp,
          vocabUrl,
          table,
          terminology,
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
  // console.log(mappingsForSearch);
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
            editUpdatedMappings(values);
            onClose();
          })
          .then(data => {
            setMapping(data);
          });
      }}
      onCancel={() => {
        onClose();
        form.resetFields();
        setSelectedMappings([]);
        setDisplaySelectedMappings([]);
        setIdsForSelect([]);
        setReset(false);
        reset &&
          getById(
            vocabUrl,
            'Table',
            `${table.id}/mapping?user_input=True&user=${user?.email}`
          ).then(data => setMapping(data.codes));
      }}
      closeIcon={false}
      maskClosable={false}
      destroyOnHidden={true}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          <div className={!reset ? 'footer_buttons' : 'save_button_only'}>
            {/* If reset and editSearch are false, the reset and edit buttons are displayed
            The reset button opens a modal to confirm mapping deletion, then the search is performed again
            in the MappingSearch modal below. The edit/add button sets editSearch to true and opens 
            the modal to perform the search in MappingSearch below. */}
            <div className="reset_edit_buttons">
              {!reset && (
                <ResetTableMappings
                  tableId={table?.id}
                  editMappings={editMappings}
                  setReset={resp => {
                    setReset(resp);
                    if (resp) {
                      setMappingsForSearch([]);
                    }
                  }}
                />
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
      ) : (
        <MappingSearch
          setEditMappings={setEditMappings}
          mappingsForSearch={mappingsForSearch}
          form={form}
          onClose={form.resetFields}
          searchProp={editMappings?.name}
          mappingDesc={
            editMappings?.description
              ? editMappings?.description
              : 'No Description'
          }
          mappingProp={editMappings?.code}
          table={table}
          terminology={null}
          preferenceType={preferenceType}
          prefTypeKey={prefTypeKey}
          loadingResults={loadingResults}
          setLoadingResults={setLoadingResults}
          editSearch={'true'}
        />
      )}
    </Modal>
  );
};
