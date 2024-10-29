import { Button, Form, message, Modal, notification, Pagination } from 'antd';
import { RequiredLogin } from '../../Auth/RequiredLogin';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { FilterAPI } from './FilterAPI';
import { getOntologies } from '../FetchManager';
import { ModalSpinner } from '../Spinner';
import { SearchContext } from '../../../Contexts/SearchContext';
import { cleanedName } from '../Utilitiy';
import { useParams } from 'react-router-dom';

export const FilterSelect = ({ component, table, terminology }) => {
  const [form] = Form.useForm();
  const { tableId } = useParams();

  const [addFilter, setAddFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOntologies, setSelectedOntologies] = useState([]);
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [displaySelectedOntologies, setDisplaySelectedOntologies] = useState(
    []
  );
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, vocabUrl, ontologyForPagination } = useContext(myContext);
  const {
    ontologyApis,
    setOntologyApis,
    apiPreferences,
    setApiPreferences,
    apiPreferencesTerm,
    setApiPreferencesTerm,
  } = useContext(SearchContext);
  const [searchText, setSearchText] = useState('');

  // Gets the ontologyAPIs on first load, automatically sets active to the first of the list to display on the page
  useEffect(() => {
    setLoading(true);
    getOntologies(vocabUrl)
      .then(data => {
        setOntologyApis(data);
        if (data.length > 0) {
          setActive(data[0]?.api_id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setActive(ontologyApis[0]?.api_id);
  }, [addFilter]);

  const handleSuccess = () => {
    setAddFilter(true);
  };
  const login = RequiredLogin({ handleSuccess: handleSuccess });

  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to page 1 when page size changes
  };

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const onClose = () => {
    setCurrentPage(1);
    setPageSize(10);
    setSelectedOntologies([]);
    setSelectedBoxes([]);
    setDisplaySelectedOntologies([]);
  };

  const preferenceTypeSet = data =>
    apiPreferencesTerm ? setApiPreferencesTerm(data) : setApiPreferences(data);

  // If the api doesn't exist in api_preference, creates an empty array for it
  // If the api_preference array for the api does not include an ontology_code, pushes the code to the array for the api
  // If there is an api in api_preferences that is not included with the ontology_code, it's added to apiPreference with an empty array
  const handleSubmit = values => {
    setLoading(true);
    const apiPreference = {
      api_preference: {},
    };

    if (values?.ontologies?.length > 0) {
      // If there are ontologies, populate apiPreference with them
      values.ontologies.forEach(({ ontology_code, api }) => {
        if (!apiPreference.api_preference[api]) {
          apiPreference.api_preference[api] = [];
        }
        if (!apiPreference.api_preference[api].includes(ontology_code)) {
          apiPreference.api_preference[api].push(ontology_code);
        }
      });
    } else {
      // If no ontologies are provided, initialize api preferences from selected_apis
      values?.selected_apis?.forEach(item => {
        const apiObj = JSON.parse(item);
        const apiName = apiObj.api_preference;
        apiPreference.api_preference[apiName] = []; // Create an empty array for each api_preference
      });
    }

    // Now handle the existing_filters
    if (values?.existing_filters?.length > 0) {
      values.existing_filters.forEach(item => {
        const apiObj = JSON.parse(item); // Parse the JSON string
        const apiName = apiObj.ontology.api; // Extract the API
        const ontologyCode = apiObj.ontology.ontology; // Extract the ontology code

        // Ensure the apiName exists in apiPreference.api_preference
        if (!apiPreference.api_preference[apiName]) {
          apiPreference.api_preference[apiName] = []; // Initialize if not already present
        }

        // Add the ontologyCode to the corresponding api, if it's not already included
        if (!apiPreference.api_preference[apiName].includes(ontologyCode)) {
          apiPreference.api_preference[apiName].push(ontologyCode);
        }
      });
    }

    const apiPreferenceDTO = {
      api_preference: apiPreference?.api_preference,
      editor: user.email,
    };

    const method =
      Object.keys(apiPreferences?.self?.api_preference || {}).length === 0
        ? 'POST'
        : 'PUT';

    fetch(
      `${vocabUrl}/Table/${(component = table
        ? table?.id
        : tableId)}/${(component = table
        ? `filter`
        : `filter/${cleanedName(terminology?.name)}`)}`,
      {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPreferenceDTO),
      }
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(() =>
        fetch(
          `${vocabUrl}/Table/${tableId}/filter/${(component = table
            ? `self`
            : `${cleanedName(terminology?.name)}`)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => {
        preferenceTypeSet(data);
        form.resetFields();
        setAddFilter(false);
        message.success('Preferred ontologies saved successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred saving the ontology preferences.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  };

  const preferenceType = apiPreferencesTerm
    ? apiPreferencesTerm
    : apiPreferences;

  const prefTypeKey = Object.keys(preferenceType)[0];

  const apiPrefObject = preferenceType[prefTypeKey]?.api_preference;

  // // Calculate the total length of all arrays
  const apiPrefLength =
    apiPrefObject &&
    Object.values(apiPrefObject)?.reduce((acc, arr) => acc + arr.length, 0);

  // Makes a set of ontologies to exclude from the list of available ones to select(excludes those that have already been selected)
  // Converts the ontologies object into an array and filter based on the ontologiesToExclude
  const filterOntologies = () => {
    if (ontologyForPagination) {
      const firstOntology = ontologyForPagination[0];
      const ontologiesObject = firstOntology?.ontologies;
      if (ontologiesObject) {
        const ontologiesToExclude = new Set(
          displaySelectedOntologies?.map(dst => dst?.ontology_code)
        );
        const filteredOntologies = Object.values(ontologiesObject)
          .map(po => ({
            ...po,
            api: ontologyForPagination?.[0]?.api_id,
          }))
          .filter(obj => {
            return !ontologiesToExclude.has(obj.ontology_code);
          });

        return filteredOntologies;
      }
    }
  };

  const filteredOntologiesArray = filterOntologies();

  // // Pagination
  const paginatedOntologies = filteredOntologiesArray?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <Button
        onClick={() => (user ? setAddFilter(true) : login())}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        API Filters {apiPrefObject ? `(${apiPrefLength})` : ''}
      </Button>
      {addFilter && (
        <Modal
          open={addFilter}
          width={'70%'}
          styles={{
            body: {
              minHeight: '60vh',
              maxHeight: '60vh',
            },
          }}
          onOk={() => {
            form.validateFields().then(values => {
              handleSubmit(values);
              onClose();
            });
          }}
          onCancel={() => {
            form.resetFields();
            setAddFilter(false);
            onClose();
          }}
          maskClosable={false}
          closeIcon={false}
          footer={(_, { OkBtn, CancelBtn }) => (
            <>
              <div className="modal_footer">
                <div className="modal_footer">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredOntologiesArray?.length}
                    onChange={handlePageChange}
                    showSizeChanger
                    onShowSizeChange={handlePageSizeChange}
                    pageSizeOptions={['10', '20', '50']} // Set page size options
                  />
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
            <FilterAPI
              form={form}
              selectedOntologies={selectedOntologies}
              setSelectedOntologies={setSelectedOntologies}
              selectedBoxes={selectedBoxes}
              setSelectedBoxes={setSelectedBoxes}
              displaySelectedOntologies={displaySelectedOntologies}
              setDisplaySelectedOntologies={setDisplaySelectedOntologies}
              ontologyApis={ontologyApis}
              active={active}
              setActive={setActive}
              searchText={searchText}
              setSearchText={setSearchText}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              paginatedOntologies={paginatedOntologies}
              apiPreferences={apiPreferences}
              table={table}
              terminology={terminology}
            />
          )}
        </Modal>
      )}
    </>
  );
};
