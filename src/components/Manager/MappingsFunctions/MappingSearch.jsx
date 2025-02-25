import { Checkbox, Form, Input, notification, Tooltip } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { myContext } from '../../../App';
import { ellipsisString } from '../Utility';
import { ModalSpinner, ResultsSpinner } from '../Spinner';
import { MappingContext } from '../../../Contexts/MappingContext';
import { SearchContext } from '../../../Contexts/SearchContext';
import { getFiltersByCode, olsFilterOntologiesSearch } from '../FetchManager';
import { OntologyCheckboxes } from './OntologyCheckboxes';
import { MappingRelationship } from './MappingRelationship';
import { useParams } from 'react-router-dom';

export const MappingSearch = ({
  setEditMappings,
  form,
  mappingsForSearch,
  onClose,
  searchProp,
  mappingProp,
  mappingDesc,
  terminology,
  table,
  preferenceType,
  prefTypeKey,
  loadingResults,
  setLoadingResults,
}) => {
  const { vocabUrl } = useContext(myContext);
  const {
    apiPreferences,
    defaultOntologies,
    setApiPreferencesCode,
    apiPreferencesCode,
    unformattedPref,
    setUnformattedPref,
    prefTerminologies,
    setApiResults,
    ontologyApis,
    entriesPerPage,
    moreAvailable,
    setMoreAvailable,
    resultsCount,
    setResultsCount,
    selectedApi,
    setSelectedApi,
  } = useContext(SearchContext);
  const { tableId } = useParams();
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [lastCount, setLastCount] = useState(0); //save last count as count of the results before you fetch data again
  const [inputValue, setInputValue] = useState(searchProp); //Sets the value of the search bar
  const [currentSearchProp, setCurrentSearchProp] = useState(searchProp);
  const [terminologiesToMap, setTerminologiesToMap] = useState([]);
  const [active, setActive] = useState(null);
  const [allCheckboxes, setAllCheckboxes] = useState([]);

  const {
    setExistingMappings,
    setSelectedMappings,
    displaySelectedMappings,
    setDisplaySelectedMappings,
    selectedBoxes,
    setSelectedBoxes,
    existingMappings,
  } = useContext(MappingContext);

  let ref = useRef();
  const { Search } = Input;

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
  const optionalTableParam =
    tableId !== undefined ? `?table_id=${tableId}` : '';
  // since the code is passed through searchProp, the '!!' forces it to be evaluated as a boolean.
  // if there is a searchProp being passed, it evaluates to true and runs the search function.
  // inputValue and currentSearchProp for the search bar is set to the passed searchProp.
  // The function is run when the code changes.
  useEffect(() => {
    setInputValue(searchProp);
    setCurrentSearchProp(searchProp);
    setPage(0);
    if (!!searchProp) {
      getFiltersByCode(
        vocabUrl,
        mappingProp,
        setApiPreferencesCode,
        notification,
        setUnformattedPref,
        table,
        terminology,
        setLoading,
        optionalTableParam
      );
    }
  }, [searchProp]);

  const codeToSearch = Object.keys(unformattedPref)?.[0];
  const savedApiPreferences = unformattedPref?.[codeToSearch]?.api_preference;
  const apiPreferenceKeys = Object?.keys(savedApiPreferences ?? {});

  useEffect(() => {
    apiPreferenceKeys?.length > 0
      ? setSelectedApi(apiPreferenceKeys[0])
      : setSelectedApi(ontologyApis?.[0]?.api_id || null);
  }, [searchProp]);

  useEffect(() => {
    if (apiPreferencesCode !== undefined) {
      fetchResults(0, searchProp);
    }
  }, [searchProp]);

  useEffect(() => {
    if (apiPreferencesCode !== undefined) {
      fetchResults(page, currentSearchProp);
    }
  }, [page, selectedApi]);

  useEffect(() => {
    if (prefTerminologies.length > 0) {
      fetchTerminologies();
    }
  }, []);

  useEffect(() => {
    setAllCheckboxes(
      terminologiesToMap.find(term => term.id === active)?.codes ?? []
    );
  }, [active]);

  useEffect(() => {
    setActive(terminologiesToMap?.[0]?.id);
  }, [terminologiesToMap]);
  // The '!!' forces currentSearchProp to be evaluated as a boolean.
  // If there is a currentSearchProp in the search bar, it evaluates to true and runs the search function.
  // The function is run when the query changes and when the preferred ontology changes.
  // If there are preferred terminologies, it runs when the OLS search bar is clicked (i.e. active)
  useEffect(() => {
    if (
      prefTerminologies.length > 0 &&
      active === 'search' &&
      !!currentSearchProp &&
      apiPreferencesCode !== undefined
    ) {
      fetchResults(page, currentSearchProp);
    } else if (
      prefTerminologies.length === 0 &&
      !!currentSearchProp &&
      apiPreferencesCode !== undefined
    ) {
      fetchResults(page, currentSearchProp);
    }
  }, [currentSearchProp, apiPreferencesCode, active]);

  /* Pagination is handled via a "View More" link at the bottom of the page. 
  Each click on the "View More" link makes an API call to fetch the next 15 results.
  This useEffect moves the scroll bar on the modal to the first index of the new batch of results.
  Because the content is in a modal and not the window, the closest class name to the modal is used for the location of the ref. */
  useEffect(() => {
    if (results?.length > 0 && page > 0 && ref.current) {
      const container = ref.current.closest('.ant-modal-body');
      const scrollTop = ref.current.offsetTop - container.offsetTop;
      container.scrollTop = scrollTop;
    }
  }, [results]);
  // Sets the value of the selected_mappings in the form to the checkboxes that are selected
  useEffect(() => {
    form.setFieldsValue({
      selected_mappings: selectedBoxes,
    });
  }, [selectedBoxes, form]);

  // sets the code to null on dismount.
  useEffect(
    () => () => {
      onClose();
      setEditMappings(null);
      setSelectedMappings([]);
      setDisplaySelectedMappings([]);
      setSelectedBoxes([]);
      setApiResults([]);
    },
    []
  );

  const handleSearch = query => {
    setCurrentSearchProp(query);
    setPage(0);
  };
  const apiForSearch = selectedApi ?? apiPreferenceKeys[0];

  // The function that makes the API call to search for the passed code.
  const fetchResults = (page, query) => {
    if (!!!query) {
      return undefined;
    }

    /* The OLS API returns 10 results by default unless specified otherwise. The fetch call includes a specified
    number of results to return per page (entriesPerPage) and a calculation of the first index to start the results
    on each new batch of results (pageStart, calculated as the number of the page * the number of entries per page */
    const pageStart = page * entriesPerPage;
    if (
      // If there are api preferences and one of them is in apiPreferencesCode
      preferenceType?.[prefTypeKey]?.api_preference
    ) {
      const apiPreferenceOntologies = () => {
        // Check if apiPreferencesCode contains the key dynamically (based on selectedApi)
        if (
          apiForSearch in apiPreferencesCode &&
          apiPreferencesCode[apiForSearch]?.length > 0
        ) {
          // Return the preferred ontologies for the matched key (apiPreferenceKeys[0])
          return apiPreferencesCode[apiPreferenceKeys[0]]
            .join(',')
            .toUpperCase();
        } else {
          // If no preferred ontologies, use the default ontologies
          return defaultOntologies;
        }
      };

      //fetch call to search API with either preferred or default ontologies
      return olsFilterOntologiesSearch(
        vocabUrl,
        query,
        apiPreferencesCode[selectedApi]?.length > 0
          ? apiPreferencesCode?.[selectedApi]?.map(sa => sa?.toUpperCase())
          : apiPreferenceOntologies(),
        page,
        entriesPerPage,
        pageStart,
        selectedBoxes,
        setResults,
        setResultsCount,
        loading ? setLoading : setLoadingResults,
        results,
        setMoreAvailable,
        selectedApi !== undefined ? selectedApi : apiPreferenceKeys[0],
        notification
      );
    } else
      return olsFilterOntologiesSearch(
        vocabUrl,
        query,
        apiPreferencesCode[selectedApi]?.length > 0
          ? apiPreferencesCode?.[selectedApi]?.map(sa => sa?.toUpperCase())
          : defaultOntologies,
        page,
        entriesPerPage,
        pageStart,
        selectedBoxes,
        setResults,
        setResultsCount,
        loading ? setLoading : setLoadingResults,
        results,
        setMoreAvailable,
        selectedApi !== undefined ? selectedApi : apiPreferenceKeys[0],
        notification
      );
  };
  // the 'View More' pagination onClick increments the page. The search function is triggered to run on page change in the useEffect.
  const handleViewMore = e => {
    e.preventDefault();
    setPage(prevPage => prevPage + 1);
  };

  // Sets the inputValue to the value of the search bar.
  const handleChange = e => {
    setInputValue(e.target.value);
  };

  const onExistingChange = checkedValues => {
    const parsedValues = checkedValues.map(cv => JSON.parse(cv));
    setExistingMappings(parsedValues);
  };

  // If the checkbox is checked, it adds the object to the selectedBoxes array
  // If it is unchecked, it filters it out of the selectedBoxes array.
  const onCheckboxChange = (event, code) => {
    if (event.target.checked) {
      setSelectedBoxes(prevState => [...prevState, code]);
    } else {
      setSelectedBoxes(prevState => prevState.filter(val => val !== code));
    }
  };

  const onSelectedChange = checkedValues => {
    const selected = JSON.parse(checkedValues?.[checkedValues.length - 1]);

    // Adds the selectedMappings to the selectedBoxes to ensure they are checked
    setSelectedBoxes(prevState => {
      const updated = [...prevState, selected];
      // Sets the values for the form to the selectedMappings checkboxes that are checked
      form.setFieldsValue({ selected_mappings: updated });
      return updated;
    });

    setDisplaySelectedMappings(prevState => [...prevState, selected]);
  };

  // The display for the checkboxes. The index is set to the count of the results before you fetch the new batch of results
  // again + 1, to move the scrollbar to the first result of the new batch.
  const newSearchDisplay = (d, index) => {
    index === lastCount + 1;
    return (
      <>
        <div
          key={index}
          // prettier-ignore
          ref={index === lastCount + 1 ? ref : undefined}
          className="modal_search_result"
          id="scrollbar"
        >
          <div>
            <div className="modal_term_ontology">
              <div>
                <b>{d?.display}</b>
              </div>
              <div className="api_ontology_code">
                <a href={d?.code_iri} target="_blank">
                  {d?.code}
                </a>
              </div>
            </div>
            {d?.description?.length > 100 ? (
              <Tooltip
                mouseEnterDelay={0.5}
                title={d?.description}
                placement="topRight"
              >
                {ellipsisString(
                  Array.isArray(d?.description)
                    ? d?.description?.map(d => d).join(',')
                    : d?.description,
                  '100'
                )}
              </Tooltip>
            ) : (
              ellipsisString(
                Array.isArray(d?.description)
                  ? d?.description?.map(d => d).join(',')
                  : d?.description,
                '100'
              )
            )}
          </div>
        </div>
      </>
    );
  };

  const selectedTermsDisplay = (d, index) => {
    return (
      <>
        <div key={index} className="modal_search_result" id="scrollbar">
          <div>
            <div className="modal_term_ontology">
              <div>
                <b>{d?.display}</b>
              </div>
              <div>
                <a
                  href={d?.code_iri}
                  target="_blank"
                  className="api_ontology_code"
                >
                  {d?.code}
                </a>
                {d?.api && (
                  <span className="display_selected_api">
                    ({d?.api?.toUpperCase()})
                  </span>
                )}
              </div>
              <div>
                <MappingRelationship mapping={d} variable={searchProp} />
              </div>
            </div>
            <div>
              {d?.description?.length > 85 ? (
                <Tooltip
                  placement="topRight"
                  mouseEnterDelay={0.5}
                  title={d?.description}
                >
                  {ellipsisString(
                    Array.isArray(d.description)
                      ? d.description?.map(d => d).join(',')
                      : d.description,
                    '85'
                  )}
                </Tooltip>
              ) : (
                ellipsisString(
                  Array.isArray(d.description)
                    ? d.description?.map(d => d).join(',')
                    : d.description,
                  '85'
                )
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  // Display for existing mappings.
  const existingMappingDisplay = (d, index) => {
    return (
      <>
        <div
          key={index}
          // prettier-ignore
          className="modal_search_result"
        >
          <div>
            <div className="modal_term_ontology">
              <div>
                <b>{d.display}</b>
              </div>
              <div>{d.code}</div>
              <div>
                <MappingRelationship mapping={d} variable={searchProp} />
              </div>
            </div>
            <div>
              {d?.description?.length > 100 ? (
                <Tooltip
                  mouseEnterDelay={0.5}
                  title={d?.description}
                  placement="topRight"
                >
                  {ellipsisString(d?.description, '100')}
                </Tooltip>
              ) : (
                ellipsisString(d?.description, '100')
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  // Sets existingMappings to the mappings that have already been mapped to pass them to the body of the PUT call on save.
  useEffect(() => {
    setExistingMappings(mappingsForSearch);
  }, []);
  // Iterates through the array of previously selected mappings. Returns a JSON stringified object to use as default checked values separate from the search results.
  const initialChecked = existingMappings.map(m =>
    JSON.stringify({
      code: m?.code,
      display: m?.display,
      description: m?.description,
      system: m?.system,
    })
  );

  // Creates a Set that excludes the mappings that have already been selected.
  // Then filteres the existing mappings out of the results to only display results that have not yet been selected.
  const getFilteredResults = () => {
    const codesToExclude = new Set([
      ...mappingsForSearch?.map(m => m?.code),
      ...displaySelectedMappings?.map(m => m?.code),
    ]);
    return results?.filter(r => !codesToExclude?.has(r.code));
  };

  const filteredResultsArray = getFilteredResults();

  // Peforms search on Tab key press
  const searchOnTab = e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleSearch(e.target.value);
    }
  };

  const checkBoxDisplay = (item, index) => {
    return (
      <>
        <div key={index} className="modal_search_result">
          <div key={index} className="modal_display_result">
            <div>
              <div className="modal_term_ontology">
                <div className="api_ontology_code">{item.code}</div>
              </div>
              <div>{item.display}</div>
              <div>
                {item?.description?.length > 85 ? (
                  <Tooltip
                    placement="topRight"
                    mouseEnterDelay={0.5}
                    title={item?.description}
                  >
                    {ellipsisString(item?.description, '85')}
                  </Tooltip>
                ) : (
                  ellipsisString(item?.description, '85')
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="results_modal_container">
        <>
          {loading === false ? (
            <>
              <div className="modal_search_results">
                <div className="modal_search_results_header">
                  <h4>{searchProp}</h4>
                  <div className="mappings_search_bar">
                    {!prefTerminologies.length > 0 && (
                      <Search
                        onSearch={handleSearch}
                        value={inputValue}
                        onChange={handleChange}
                        onKeyDown={searchOnTab}
                      />
                    )}
                  </div>
                  <span className="search-desc">{mappingDesc}</span>
                </div>
                {/* ant.design form displaying the checkboxes with the search results.  */}
                <div className="result_container">
                  <Form form={form} layout="vertical" preserve={false}>
                    <div className="all_checkboxes_container">
                      <div className="mapping_modal_left">
                        {terminologiesToMap?.length > 0 && (
                          <div className="assign_map_checkbox_container">
                            <div className="assign_map_checkbox_wrapper">
                              <div
                                className="pref_tab"
                                onClick={() =>
                                  setActive(terminologiesToMap?.[0]?.id)
                                }
                              >
                                <b>Preferred Terminologies</b>
                              </div>
                              <div className="">
                                {terminologiesToMap.map((term, i) => (
                                  <div
                                    key={i}
                                    className={
                                      active === term.id
                                        ? 'active_term'
                                        : active !== term.id &&
                                          active !== 'search'
                                        ? 'inactive_term'
                                        : active === 'search' && 'hidden_term'
                                    }
                                    onClick={() => setActive(term.id)}
                                  >
                                    {term.name}
                                  </div>
                                ))}
                              </div>
                              <div
                                onClick={() => setActive('search')}
                                className={
                                  active === 'search'
                                    ? 'active_term'
                                    : 'inactive_term'
                                }
                              >
                                <Search
                                  onSearch={handleSearch}
                                  value={inputValue}
                                  onChange={handleChange}
                                  onKeyDown={searchOnTab}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {((prefTerminologies.length > 0 &&
                          active === 'search') ||
                          prefTerminologies.length === 0) && (
                          <OntologyCheckboxes
                            apiPreferences={apiPreferences}
                            active={active}
                          />
                        )}
                      </div>
                      <div>
                        <div className="result_form">
                          {loadingResults ? (
                            <ResultsSpinner />
                          ) : (
                            <>
                              {mappingsForSearch?.length > 0 && (
                                <Form.Item
                                  initialValue={initialChecked}
                                  name={['existing_mappings']}
                                  valuePropName="value"
                                  rules={[
                                    {
                                      required: false,
                                    },
                                  ]}
                                >
                                  <Checkbox.Group
                                    className="mappings_checkbox existing_display"
                                    options={mappingsForSearch?.map(
                                      (d, index) => {
                                        return {
                                          value: JSON.stringify({
                                            code: d.code,
                                            display: d.display,
                                            description: d.description,
                                            system: d.system,
                                          }),
                                          label: existingMappingDisplay(
                                            d,
                                            index
                                          ),
                                        };
                                      }
                                    )}
                                    onChange={onExistingChange}
                                  />
                                </Form.Item>
                              )}
                              {displaySelectedMappings?.length > 0 && (
                                <Form.Item
                                  name="selected_mappings"
                                  valuePropName="value"
                                  rules={[{ required: false }]}
                                >
                                  <div className="modal_display_results">
                                    {displaySelectedMappings?.map((sm, i) => (
                                      <Checkbox
                                        key={i}
                                        onChange={e => onCheckboxChange(e, sm)}
                                        checked={
                                          active === 'search'
                                            ? selectedBoxes.some(
                                                box => box.code === sm.code
                                              )
                                            : selectedBoxes.some(
                                                box => box.code === sm.code
                                              )
                                        }
                                        value={sm}
                                      >
                                        {selectedTermsDisplay(sm, i)}
                                      </Checkbox>
                                    ))}
                                  </div>
                                </Form.Item>
                              )}
                              {(prefTerminologies.length > 0 &&
                                active === 'search') ||
                              prefTerminologies.length === 0 ? (
                                results?.length > 0 ? (
                                  <>
                                    <Form.Item
                                      name={['filtered_mappings']}
                                      valuePropName="value"
                                      rules={[
                                        {
                                          required: false,
                                        },
                                      ]}
                                    >
                                      {filteredResultsArray?.length > 0 && (
                                        <Checkbox.Group
                                          className="mappings_checkbox"
                                          options={filteredResultsArray?.map(
                                            (d, index) => {
                                              return {
                                                value: JSON.stringify({
                                                  code: d.code,
                                                  display: d.display,
                                                  description: d.description
                                                    ?.map(d => d)
                                                    .join(','),
                                                  system: d?.system,
                                                  api: d.api,
                                                }),
                                                label: newSearchDisplay(
                                                  d,
                                                  index
                                                ),
                                              };
                                            }
                                          )}
                                          onChange={onSelectedChange}
                                        />
                                      )}
                                    </Form.Item>
                                  </>
                                ) : (
                                  <h3>No results found</h3>
                                )
                              ) : (
                                <Form.Item
                                  name={['mappings']}
                                  valuePropName="value"
                                  rules={[
                                    {
                                      required: false,
                                    },
                                  ]}
                                >
                                  <Checkbox.Group
                                    className="mappings_checkbox"
                                    options={allCheckboxes
                                      .filter(
                                        checkbox =>
                                          !displaySelectedMappings.some(
                                            dsm => checkbox.code === dsm.code
                                          )
                                      )
                                      .map((code, index) => ({
                                        value: JSON.stringify({
                                          code: code.code,
                                          display: code.display,
                                          description: code.description,
                                          system: code.system,
                                        }),
                                        label: checkBoxDisplay(code, index),
                                      }))}
                                    onChange={onSelectedChange}
                                  />
                                </Form.Item>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Form>
                  {((prefTerminologies.length > 0 && active === 'search') ||
                    prefTerminologies.length === 0) && (
                    <div className="view_more_wrapper">
                      {/* 'View More' pagination */}

                      {moreAvailable && !loadingResults && (
                        <span
                          className="view_more_link"
                          onClick={e => {
                            handleViewMore(e);
                            setLastCount(resultsCount);
                          }}
                        >
                          View More
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="loading_spinner">
              <ModalSpinner />
            </div>
          )}
        </>
      </div>
    </>
  );
};
