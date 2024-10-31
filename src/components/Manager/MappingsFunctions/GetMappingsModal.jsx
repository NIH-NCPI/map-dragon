import {
  Checkbox,
  Form,
  Input,
  message,
  Modal,
  notification,
  Tooltip,
} from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { myContext } from '../../../App';
import { ellipsisString, systemsMatch } from '../Utilitiy';
import { ModalSpinner } from '../Spinner';
import { MappingContext } from '../../../Contexts/MappingContext';
import { SearchContext } from '../../../Contexts/SearchContext';
import { getFiltersByCode, olsFilterOntologiesSearch } from '../FetchManager';
import { OntologyCheckboxes } from './OntologyCheckboxes';
import {
  OntologyFilterCodeSubmit,
  OntologyFilterCodeSubmitTerm,
} from './OntologyFilterCodeSubmit';
import { useParams } from 'react-router-dom';

export const GetMappingsModal = ({
  componentString,
  setGetMappings,
  setMapping,
  searchProp,
  component,
  mappingProp,
  mappingDesc,
  table,
  terminology,
}) => {
  const { tableId } = useParams();
  const [form] = Form.useForm();
  const { Search } = Input;
  const { searchUrl, vocabUrl, setSelectedKey, user } = useContext(myContext);
  const {
    preferenceType,
    defaultOntologies,
    setFacetCounts,
    setApiPreferencesCode,
    apiPreferencesCode,
    setUnformattedPref,
    preferenceTypeSet,
    prefTypeKey,
  } = useContext(SearchContext);
  const [page, setPage] = useState(0);
  const entriesPerPage = 2000;
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState();
  const [resultsCount, setResultsCount] = useState();
  const [lastCount, setLastCount] = useState(0); //save last count as count of the results before you fetch data again
  const [filteredResultsCount, setFilteredResultsCount] = useState(0);
  const [inputValue, setInputValue] = useState(searchProp); //Sets the value of the search bar
  const [currentSearchProp, setCurrentSearchProp] = useState(searchProp);
  const {
    setSelectedMappings,
    displaySelectedMappings,
    setDisplaySelectedMappings,
    selectedBoxes,
    setSelectedBoxes,
  } = useContext(MappingContext);
  let ref = useRef();

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
        component,
        mappingProp,
        setApiPreferencesCode,
        notification,
        setUnformattedPref,
        table,
        terminology
      );
    }
  }, [searchProp]);

  useEffect(() => {
    if (apiPreferencesCode !== undefined) fetchResults(0, searchProp);
  }, [apiPreferencesCode, searchProp]);

  useEffect(() => {
    if (!!currentSearchProp) {
      fetchResults(page, currentSearchProp);
    }
  }, [page, currentSearchProp]);

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

  // Resets the states when unMounting
  useEffect(
    () => () => {
      setGetMappings(null);
      setSelectedMappings([]);
      setDisplaySelectedMappings([]);
      setSelectedBoxes([]);
    },
    []
  );

  const onClose = () => {
    setPage(0);
    setResults([]);
    setSelectedMappings([]);
    setDisplaySelectedMappings([]);
    setApiPreferencesCode(undefined);
    setSelectedBoxes([]);
    setSelectedKey(null);
  };

  // Sets currentSearchProp to the value of the search bar and sets page to 0.
  const handleSearch = query => {
    setCurrentSearchProp(query);
    setPage(0);
  };

  // Function to send a PUT call to update the mappings.
  // Each mapping in the mappings array being edited is JSON.parsed and pushed to the blank mappings array.
  // The mappings are turned into objects in the mappings array.
  const handleSubmit = values => {
    const selectedMappings = selectedBoxes?.map(item => ({
      code: item.obo_id,
      display: item.label,
      description: item.description[0],
      system: systemsMatch(item.obo_id.split(':')[0]),
    }));
    const mappingsDTO = {
      mappings: selectedMappings,
      editor: user.email,
    };
    setLoading(true);
    fetch(
      `${vocabUrl}/${componentString}/${component.id}/mapping/${mappingProp}`,
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
        setGetMappings(null);
        message.success('Changes saved successfully.');
      })
      .then(() =>
        table
          ? OntologyFilterCodeSubmit(
              apiPreferencesCode,
              preferenceType,
              prefTypeKey,
              mappingProp,
              vocabUrl,
              table
            )
          : OntologyFilterCodeSubmitTerm(
              apiPreferencesCode,
              preferenceType,
              prefTypeKey,
              searchProp,
              vocabUrl,
              terminology
            )
      )
      .finally(() => setLoading(false));
  };

  const fetchResults = (page, query) => {
    if (!!!query) {
      return undefined;
    }
    /* The OLS API returns 10 results by default unless specified otherwise. The fetch call includes a specified
    number of results to return per page (entriesPerPage) and a calculation of the first index to start the results
    on each new batch of results (pageStart, calculated as the number of the page * the number of entries per page */
    const pageStart = page * entriesPerPage;

    if (
      //If there are api preferences and one of them is OLS, it gets the preferred ontologies
      preferenceType[prefTypeKey]?.api_preference &&
      'ols' in preferenceType[prefTypeKey]?.api_preference
    ) {
      const apiPreferenceOntologies = () => {
        if (preferenceType[prefTypeKey]?.api_preference?.ols) {
          return preferenceType[prefTypeKey].api_preference.ols.join(',');
        } else {
          // else if there are no preferred ontologies, it uses the default ontologies
          return defaultOntologies;
        }
      };
      //fetch call to search OLS with either preferred or default ontologies
      return olsFilterOntologiesSearch(
        searchUrl,
        query,
        apiPreferencesCode !== ''
          ? apiPreferencesCode
          : apiPreferenceOntologies(),
        page,
        entriesPerPage,
        pageStart,
        selectedBoxes,
        setTotalCount,
        setResults,
        setFilteredResultsCount,
        setResultsCount,
        setLoading,
        results,
        setFacetCounts
      );
    } else
      return olsFilterOntologiesSearch(
        searchUrl,
        query,
        apiPreferencesCode !== '' ? apiPreferencesCode : defaultOntologies,
        page,
        entriesPerPage,
        pageStart,
        selectedBoxes,
        setTotalCount,
        setResults,
        setFilteredResultsCount,
        setResultsCount,
        setLoading,
        results,
        setFacetCounts
      );
  };

  // the 'View More' pagination onClick increments the page. The search function is triggered to run on page change in the useEffect.
  const handleViewMore = e => {
    e.preventDefault();
    setPage(prevPage => prevPage + 1);
  };

  // The display for the checkboxes. The index is set to the count of the results before you fetch the new batch of results
  // again + 1, to move the scrollbar to the first result of the new batch.
  const checkBoxDisplay = (d, index) => {
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
                <b>{d.label}</b>
              </div>
              <div>
                <a href={d.iri} target="_blank">
                  {d.obo_id}
                </a>
              </div>
            </div>
            <div>{ellipsisString(d?.description[0], '120')}</div>
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
                <b>{d?.label}</b>
              </div>
              <div>
                <a href={d?.iri} target="_blank">
                  {d?.obo_id}
                </a>
              </div>
            </div>
            <div>{ellipsisString(d?.description[0], '100')}</div>
          </div>
        </div>
      </>
    );
  };

  // Sets the inputValue to the value of the search bar.
  const handleChange = e => {
    setInputValue(e.target.value);
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
    const selected = JSON.parse(checkedValues?.[0]);
    const selectedMapping = results.find(
      result => result.obo_id === selected.code
    );

    // Updates selectedMappings and displaySelectedMappings to include the new selected items
    setSelectedMappings(prevState => [...prevState, selectedMapping]);

    // Adds the selectedMappings to the selectedBoxes to ensure they are checked
    setSelectedBoxes(prevState => {
      const updated = [...prevState, selectedMapping];
      // Sets the values for the form to the selectedMappings checkboxes that are checked
      form.setFieldsValue({ selected_mappings: updated });
      return updated;
    });

    setDisplaySelectedMappings(prevState => [...prevState, selectedMapping]);

    // Filters out the selected checkboxes from the results being displayed
    const updatedResults = results.filter(
      result => result.obo_id !== selected.code
    );
    setResults(updatedResults);
  };

  // Creates a Set that excludes the mappings that have already been selected.
  // Then filteres the existing mappings out of the results to only display results that have not yet been selected.
  const getFilteredResults = () => {
    const codesToExclude = new Set([
      ...displaySelectedMappings?.map(m => m?.code),
    ]);
    return results.filter(r => !codesToExclude?.has(r.obo_id));
  };

  const filteredResultsArray = getFilteredResults();

  return (
    <>
      <Modal
        open={!!searchProp}
        closeIcon={false}
        width={'70%'}
        styles={{ body: { height: '60vh', overflowY: 'auto' } }}
        okText="Save"
        onOk={() => {
          form.validateFields().then(values => {
            handleSubmit(values);
            onClose();
          });
        }}
        onCancel={() => {
          onClose();
          form.resetFields();
          setGetMappings(null);
        }}
        maskClosable={false}
        destroyOnClose={true}
        cancelButtonProps={{ disabled: loading }}
        okButtonProps={{ disabled: loading }}
      >
        {loading ? (
          <ModalSpinner />
        ) : (
          <div className="results_modal_container">
            <>
              <div className="modal_search_results">
                <div className="modal_search_results_header">
                  <h4>{searchProp}</h4>
                  <div className="mappings_search_bar">
                    <Search
                      onSearch={handleSearch}
                      value={inputValue}
                      onChange={handleChange}
                    />
                  </div>
                  <span className="search-desc">{mappingDesc}</span>
                </div>
                {/* ant.design form displaying the checkboxes with the search results.  */}
                <div className="result_container">
                  <Form form={form} layout="vertical" preserve={false}>
                    <div className="all_checkboxes_container">
                      <OntologyCheckboxes preferenceType={preferenceType} />
                      <div className="result_form">
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
                                  checked={selectedBoxes.some(
                                    box => box.obo_id === sm.obo_id
                                  )}
                                  value={sm}
                                  onChange={e => onCheckboxChange(e, sm, i)}
                                >
                                  {selectedTermsDisplay(sm, i)}
                                </Checkbox>
                              ))}
                            </div>
                          </Form.Item>
                        )}
                        {results?.length > 0 ? (
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
                              {filteredResultsArray?.length > 0 ? (
                                <Checkbox.Group
                                  className="mappings_checkbox"
                                  options={filteredResultsArray?.map(
                                    (d, index) => {
                                      return {
                                        value: JSON.stringify({
                                          code: d.obo_id,
                                          display: d.label,
                                          description: d.description[0],
                                          system: systemsMatch(
                                            d?.obo_id.split(':')[0]
                                          ),
                                        }),
                                        label: checkBoxDisplay(d, index),
                                      };
                                    }
                                  )}
                                  onChange={onSelectedChange}
                                />
                              ) : (
                                ''
                              )}
                            </Form.Item>{' '}
                          </>
                        ) : (
                          <h3>No results found</h3>
                        )}
                      </div>
                    </div>
                  </Form>
                  <div className="view_more_wrapper">
                    {/* 'View More' pagination displaying the number of results being displayed
                      out of the total number of results. Because of the filter to filter out the duplicates,
                      there is a tooltip informing the user that redundant entries have been removed to explain any
                      inconsistencies in results numbers per page. */}
                    <Tooltip
                      placement="bottom"
                      title={`${filteredResultsCount} redundant entries have been removed`}
                    >
                      Displaying {resultsCount}
                      &nbsp;of&nbsp;{totalCount}
                    </Tooltip>
                    {resultsCount < totalCount - filteredResultsCount && (
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
                </div>
              </div>
            </>
          </div>
        )}
      </Modal>
    </>
  );
};
