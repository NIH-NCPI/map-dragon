import { Button, Form, message, Modal, notification, Pagination } from 'antd';
import { RequiredLogin } from '../../Auth/RequiredLogin';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { FilterAPI } from './FilterAPI';
import { getOntologies } from '../FetchManager';
import { ModalSpinner } from '../Spinner';
import { SearchContext } from '../../../Contexts/SearchContext';

export const FilterSelect = ({
  component,
  table,
  terminology,
  componentString
}) => {
  const [form] = Form.useForm();

  const [addFilter, setAddFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOntologies, setSelectedOntologies] = useState([]);
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [displaySelectedOntologies, setDisplaySelectedOntologies] = useState(
    []
  );
  const [selectedTerminologies, setSelectedTerminologies] = useState([]);

  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [displaySelectedTerminologies, setDisplaySelectedTerminologies] =
    useState([]);
  const [terminologies, setTerminologies] = useState([]);
  const { user, vocabUrl, ontologyForPagination } = useContext(myContext);
  const {
    ontologyApis,
    setOntologyApis,
    apiPreferences,
    apiPreferencesTerm,
    preferenceTypeSet,
    preferenceType,
    prefTypeKey,
    searchText,
    setSearchText,
    prefTerminologies,
    existingPreferred,
    setExistingPreferred,
    preferredData,
    setPreferredData,
    setPrefTerminologies
  } = useContext(SearchContext);

  useEffect(() => {
    setExistingOntologies(initialChecked);
    setExistingPreferred(initialCheckedTerm);
  }, [addFilter]);

  const existingFilters = Object.values(
    preferenceType[prefTypeKey] || {}
  )?.flat();

  const flattenedFilters = existingFilters
    .flatMap(item =>
      Object.keys(item).map(key =>
        item[key].map(value => ({
          api: key,
          ontology: value
        }))
      )
    )
    .flat();

  let initialChecked = {};
  Array.from(new Set(flattenedFilters.map(ff => ff.api))).forEach(api => {
    initialChecked[api] = flattenedFilters
      .filter(ff => ff.api === api)
      .map(item => item.ontology);
  });

  const initialCheckedTerm = preferredData?.map(term =>
    JSON.stringify({
      preferred_terminology: term?.id
    })
  );

  const [existingOntologies, setExistingOntologies] = useState(initialChecked);

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
      .then(() => fetchTerminologies())
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTerminologies();
  }, [prefTerminologies]);

  const fetchTerminologies = () => {
    // Maps through prefTerminologies and fetches each terminology by its id
    const fetchPromises = prefTerminologies?.map(pref =>
      fetch(`${vocabUrl}/${pref?.reference}`).then(response => response.json())
    );

    Promise.all(fetchPromises)
      .then(results => {
        // Once all fetch calls are resolved, set the combined data
        setPreferredData(results);
        setExistingPreferred(results);
      })
      .catch(error => {
        notification.error({
          message: 'Error',
          description: 'An error occurred. Please try again.'
        });
      });
  };
  // Sets the first API in the list as active
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
    setSelectedTerminologies([]);
    setSelectedBoxes([]);
    setDisplaySelectedOntologies([]);
    setDisplaySelectedTerminologies([]);
    setSearchText('');
  };

  // If the api doesn't exist in api_preference, creates an empty array for it
  // If the api_preference array for the api does not include an ontology_code, pushes the code to the array for the api
  // If there is an api in api_preferences that is not included with the ontology_code, it's added to apiPreference with an empty array
  const handleSubmit = async values => {
    try {
      setLoading(true);

      const ontologyBoxes = selectedBoxes.filter(box => box.ontology_code);
      const terminologyBoxes = selectedBoxes.filter(box => box.id);

      const preferredTerminologies = [
        ...(existingPreferred?.map(ep => JSON.parse(ep)) ?? []),
        ...(terminologyBoxes?.map(item => ({
          preferred_terminology: item.id
        })) ?? [])
      ];
      const preferredTermDTO = () => {
        return {
          'editor': user.email,
          'preferred_terminologies': preferredTerminologies
        };
      };

      const apiPreferenceDTO = {
        api_preference: { ...existingOntologies },
        editor: user?.email
      };

      ontologyBoxes.forEach(box => {
        const api = box.api;
        const ontology_code = box.ontology_code;

        if (apiPreferenceDTO.api_preference[api]) {
          apiPreferenceDTO.api_preference[api] = [
            ...new Set([...apiPreferenceDTO.api_preference[api], ontology_code])
          ];
        } else {
          apiPreferenceDTO.api_preference[api] = [ontology_code];
        }
      });

      const method =
        Object.keys(preferenceType[prefTypeKey]?.api_preference || {})
          .length === 0
          ? 'POST'
          : 'PUT';

      const ontologyFetch = await fetch(
        `${vocabUrl}/${(component = table
          ? `Table/${table.id}/filter/self`
          : `Terminology/${terminology.id}/filter`)}`,
        {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPreferenceDTO)
        }
      );

      const terminologyFetch = await fetch(
        `${vocabUrl}/${componentString}/${
          terminology ? terminology.id : table.id
        }/preferred_terminology`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(preferredTermDTO())
        }
      );

      const ontologyData = await ontologyFetch.json();

      const termData = await terminologyFetch.json();

      preferenceTypeSet({
        self: { api_preference: ontologyData?.onto_api_preference }
      });
      setPrefTerminologies(
        termData?.references?.map(ref => ({
          reference: `Terminology/${ref.preferred_terminology}`
        }))
      );
      setPreferredData(
        termData?.references?.map(ref => ({
          reference: `Terminology/${ref.preferred_terminology}`
        }))
      );

      form.resetFields();
      setAddFilter(false);
      message.success('Preferences saved successfully.');
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'An error occurred saving preferences.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Creates a dynamic api preference object
  const apiPrefObject = preferenceType[prefTypeKey]?.api_preference;

  // Calculates the total length of all arrays to display number of ontology filters
  const apiPrefLength = () => {
    const ontoLength =
      apiPrefObject &&
      Object.values(apiPrefObject)?.reduce((acc, arr) => acc + arr.length, 0);
    const termLength = prefTerminologies && prefTerminologies.length;

    return ontoLength + termLength;
  };

  // Makes a set of ontologies to exclude from the list of available (excludes those that have already been selected)
  // Converts the ontologies object into an array and filters based on the ontologiesToExclude
  // Then filters that object based on the searchText in the search bar
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
            api: ontologyForPagination?.[0]?.api_id
          }))
          .filter(obj => {
            return !ontologiesToExclude.has(obj.ontology_code);
          })
          .filter(item =>
            item?.curie.toLowerCase().includes(searchText.toLowerCase())
          );

        return filteredOntologies;
      }
    }
  };
  const filteredOntologiesArray = filterOntologies();

  // Pagination
  const paginatedOntologies = filteredOntologiesArray?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const filterTerminologies = () => {
    const terminologiesToExclude = new Set([
      ...prefTerminologies?.map(pt => `${pt?.name}|${pt?.url}`),
      ...displaySelectedTerminologies?.map(dst => `${dst?.name}|${dst?.url}`),
      ...preferredData?.map(ep => `${ep?.name}|${ep?.url}`)
    ]);

    return terminologies.filter(
      t => !terminologiesToExclude.has(`${t?.name}|${t?.url}`)
    );
  };

  const filteredTerminologyArray = filterTerminologies();

  // Searches for terminologies by keystroke
  const getFilteredItems = () =>
    filteredTerminologyArray?.filter(
      item =>
        item?.name &&
        item?.name.toLowerCase().includes(searchText.toLowerCase())
    );

  // Pagination
  const paginatedTerminologies = getFilteredItems().slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <Button
        onClick={() => (user ? setAddFilter(true) : login())}
        type="primary"
        style={{
          marginBottom: 16
        }}
      >
        Ontology Filters{' '}
        {apiPrefObject || prefTerminologies ? `(${apiPrefLength()})` : ''}
      </Button>
      {addFilter && (
        <Modal
          open={addFilter}
          width={'70%'}
          styles={{
            body: {
              minHeight: '60vh',
              maxHeight: '60vh'
            }
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
                    total={
                      active === 'term'
                        ? filteredTerminologyArray?.length
                        : filteredOntologiesArray?.length
                    }
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
              setSelectedOntologies={setSelectedOntologies}
              selectedBoxes={selectedBoxes}
              setSelectedBoxes={setSelectedBoxes}
              displaySelectedOntologies={displaySelectedOntologies}
              setDisplaySelectedOntologies={setDisplaySelectedOntologies}
              ontologyApis={ontologyApis}
              active={active}
              setActive={setActive}
              paginatedOntologies={paginatedOntologies}
              table={table}
              terminology={terminology}
              existingOntologies={existingOntologies}
              setExistingOntologies={setExistingOntologies}
              flattenedFilters={flattenedFilters}
              setExistingPreferred={setExistingPreferred}
              existingPreferred={existingPreferred}
              preferredData={preferredData}
              paginatedTerminologies={paginatedTerminologies}
              displaySelectedTerminologies={displaySelectedTerminologies}
              setDisplaySelectedTerminologies={setDisplaySelectedTerminologies}
              terminologies={terminologies}
              setTerminologies={setTerminologies}
              selectedTerminologies={selectedTerminologies}
              setSelectedTerminologies={setSelectedTerminologies}
              componentString={componentString}
              setPrefTerminologies={setPrefTerminologies}
            />
          )}
        </Modal>
      )}
    </>
  );
};
