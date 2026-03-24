import { Form, message, Modal, notification } from 'antd';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { ModalSpinner } from '../../Manager/Spinner';
import { MappingSearch } from '../../Manager/MappingsFunctions/MappingSearch';
import { ResetMappings } from './ResetMappings';
import { uriEncoded } from '../../Manager/Utility';
import { getById, ontologyFilterCodeSubmit } from '../../Manager/FetchManager';
import { SearchContext } from '../../../Contexts/SearchContext';
import { MappingContext } from '../../../Contexts/MappingContext';

export const EditMappingsModal = ({
  editMappings,
  setEditMappings,
  setMapping,
  terminology,
  mappingsForSearch,
  setMappingsForSearch
}) => {
  const [form] = Form.useForm();
  const { vocabUrl, setSelectedKey, user } = useContext(myContext);
  const {
    setShowOptions,
    idsForSelect,
    setIdsForSelect,
    selectedBoxes,
    existingMappings
  } = useContext(MappingContext);
  const {
    apiPreferencesCode,
    setApiPreferencesCode,
    preferenceType,
    prefTypeKey
  } = useContext(SearchContext);
  const [loading, setLoading] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [reset, setReset] = useState(false);
  const [editSearch, setEditSearch] = useState(false);

  const clearData = () => {
    setSelectedKey(null);
    setApiPreferencesCode(undefined);
    setShowOptions(false);
  };

  // Function to send a PUT call to update the mappings after code name change.
  // The existing and new mappings are JSON.parsed combined into one mappings array to be passed into the body of the PUT call.
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
      `${vocabUrl}/Terminology/${terminology.id}/mapping/${uriEncoded(
        editMappings.code
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
          editMappings.code,
          vocabUrl,
          null,
          terminology,
          notification
        )
      )
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
            editUpdatedMappings(values);
            clearData();
          })
          .then(data => setMapping(data));
      }}
      onCancel={() => {
        clearData();
        form.resetFields();
        setEditMappings(null);
        setReset(false);
        setEditSearch(false);
        setIdsForSelect([]);
        reset &&
          getById(
            vocabUrl,
            'Terminology',
            `${terminology.id}/mapping?user_input=True&user=${user?.email}`
          ).then(data => setMapping(data.codes));
      }}
      cancelButtonProps={{ disabled: loading }}
      okButtonProps={{ disabled: loading }}
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
                <ResetMappings
                  terminologyId={terminology.id}
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
    >
      {loading ? (
        <ModalSpinner />
      ) : (
        // If reset or editSearch is true the MappingSearch modal opens to perform the search for the terminology code
        <MappingSearch
          setEditMappings={setEditMappings}
          mappingsForSearch={mappingsForSearch}
          form={form}
          onClose={form.resetFields}
          searchProp={
            editMappings?.display ? editMappings?.display : editMappings?.code
          }
          mappingDesc={
            editMappings?.description
              ? editMappings?.description
              : 'No Description'
          }
          mappingProp={editMappings?.code}
          table={null}
          terminology={terminology}
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
