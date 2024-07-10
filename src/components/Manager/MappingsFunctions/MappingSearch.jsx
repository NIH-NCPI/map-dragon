import { Checkbox, Form, Input, notification, Tooltip } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { myContext } from '../../../App';
import { ellipsisString, ontologyReducer, systemsMatch } from '../Utilitiy';
import { ModalSpinner } from '../Spinner';
import { MappingContext } from '../../../MappingContext';

export const MappingSearch = ({
  setEditMappings,
  form,
  mappingsForSearch,
  onClose,
  searchProp,
}) => {
  const { searchUrl } = useContext(myContext);
  const [page, setPage] = useState(0);
  const entriesPerPage = 15;
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState();
  const [resultsCount, setResultsCount] = useState(); //
  const [lastCount, setLastCount] = useState(0); //save last count as count of the results before you fetch data again
  const [filteredResultsCount, setFilteredResultsCount] = useState(0);
  const [inputValue, setInputValue] = useState(searchProp); //Sets the value of the search bar
  const [currentSearchProp, setCurrentSearchProp] = useState(searchProp);
  const [selectedBoxes, setSelectedBoxes] = useState([]);

  const {
    setExistingMappings,
    selectedMappings,
    setSelectedMappings,
    displaySelectedMappings,
    setDisplaySelectedMappings,
  } = useContext(MappingContext);

  let ref = useRef();
  const { Search } = Input;

  // since the code is passed through searchProp, the '!!' forces it to be evaluated as a boolean.
  // if there is a searchProp being passed, it evaluates to true and runs the search function.
  // inputValue and currentSearchProp for the search bar is set to the passed searchProp.
  // The function is run when the code changes.
  useEffect(() => {
    setInputValue(searchProp);
    setCurrentSearchProp(searchProp);
    setPage(0);
    if (!!searchProp) {
      fetchResults(0, searchProp);
    }
  }, [searchProp]);

  // The '!!' forces currentSearchProp to be evaluated as a boolean.
  // If there is a currentSearchProp in the search bar, it evaluates to true and runs the search function.
  // The function is run when the code and when the page changes.
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
    if (results && page > 0) {
      const container = ref.current.closest('.ant-modal-body');
      const scrollTop = ref.current.offsetTop - container.offsetTop;
      container.scrollTop = scrollTop;
    }
  }, [results]);

  // sets the code to null on dismount.
  useEffect(
    () => () => {
      onClose();
      setEditMappings(null);
      setSelectedMappings(null);
    },
    []
  );

  const handleSearch = query => {
    setCurrentSearchProp(query);
    setPage(0);
  };

  // The function that makes the API call to search for the passed code.
  const fetchResults = (page, query) => {
    if (!!!query) {
      return undefined;
    }
    setLoading(true);

    /* The OLS API returns 10 results by default unless specified otherwise. The fetch call includes a specified
    number of results to return per page (entriesPerPage) and a calculation of the first index to start the results
    on each new batch of results (pageStart, calculated as the number of the page * the number of entries per page */
    const pageStart = page * entriesPerPage;
    return fetch(
      `${searchUrl}q=${query}&ontology=mondo,hp,maxo,ncit&rows=${entriesPerPage}&start=${pageStart}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(res => res.json())
      .then(data => {
        // filters results through the ontologyReducer function (defined in Manager/Utility.jsx)
        let res = ontologyReducer(data?.response?.docs);
        // if the page > 0 (i.e. if this is not the first batch of results), the new results
        // are concatenated to the old
        if (page > 0 && results.length > 0) {
          res.results = results.concat(res.results);
        } else {
          // the total number of search results are set to totalCount for pagination
          setTotalCount(data.response.numFound);
        }
        //the results are set to res (the filtered, concatenated results)
        setResults(res.results);
        setFilteredResultsCount(res?.filteredResults?.length);

        // resultsCount is set to the length of the filtered, concatenated results for pagination
        setResultsCount(res.results.length);
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
    setExistingMappings(checkedValues);
  };

  const onCheckboxChange = (event, code) => {
    if (event.target.checked) {
      setSelectedBoxes(prevState => [...prevState, code]);
    } else {
      setSelectedBoxes(prevState => prevState.filter(val => val !== code));
    }
  };
  const onSelectedChange = checkedValues => {
    const selected = JSON.parse(checkedValues?.[0]);
    const selectedMapping = results.filter(
      result => result.obo_id === selected.code
    );

    // Update selectedMappings and displaySelectedMappings to include the new selected items
    setSelectedMappings([...selectedMappings, selectedMapping[0]]);
    setSelectedBoxes(prevState => [...prevState, selected.code]);
    setDisplaySelectedMappings([
      ...displaySelectedMappings,
      ...selectedMapping,
    ]);

    // Filter out the selected items from the results
    const updatedResults = results.filter(
      result => result.obo_id !== selected.code
    );
    console.log('NEW REUSLTE!!!', updatedResults);
    setResults(updatedResults);
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
                <b>{d.label}</b>
              </div>
              <div>
                <a href={d.iri} target="_blank">
                  {d.obo_id}
                </a>
              </div>
            </div>
            <div>{ellipsisString(d?.description?.[0], '100')}</div>
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
            <div>{ellipsisString(d?.description, '100')}</div>
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
              <div>
                {/* <a href={d.iri} target="_blank"> */}
                {d.code}
                {/* </a> */}
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

  // Iterates through the array of previously selected mappings. Returns a JSON stringified object that is pushed to a separate array.
  // That array is returned to use as default checked values separate from the search results.
  const initialChecked = () => {
    let initialMappings = [];

    mappingsForSearch.forEach((m, index) => {
      const val = JSON.stringify({
        code: m?.code,
        display: m?.display,
        description: m?.description,
        system: m?.system,
      });
      initialMappings.push(val);
    });
    return initialMappings;
  };

  const initialCheckedSearch = () => {
    let initialCheckedMappings = [];
    displaySelectedMappings.forEach(d => {
      const val = JSON.stringify({
        code: d.obo_id,
        display: d.label,
        description: d.description?.[0],
        system: systemsMatch(d.obo_id.split(':')[0]),
      });
      initialCheckedMappings.push(val);
    });
    return initialCheckedMappings;
  };

  // Sets existingMappings to the mappings that have already been mapped to pass them to the body of the PUT call on save.
  useEffect(() => {
    setExistingMappings(mappingsForSearch);
  }, []);

  // Creates a Set that excludes the mappings that have already been selected.
  // Then filteres the existing mappings out of the results to only display results that have not yet been selected.
  const getFilteredResults = () => {
    const codesToExclude = new Set([
      ...mappingsForSearch?.map(m => m?.code),
      ...selectedMappings?.map(m => m?.code),
    ]);
    return results.filter(r => !codesToExclude.has(r.obo_id));
  };

  const filteredResultsArray = getFilteredResults();

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
                    <Search
                      onSearch={handleSearch}
                      value={inputValue}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                {/* ant.design form displaying the checkboxes with the search results.  */}
                {results?.length > 0 ? (
                  <div className="result_container">
                    <Form form={form} layout="vertical">
                      <Form.Item
                        initialValue={initialChecked()}
                        name={['existing_mappings']}
                        valuePropName="value"
                        rules={[
                          {
                            required: false,
                          },
                        ]}
                      >
                        {mappingsForSearch?.length > 0 && (
                          <Checkbox.Group
                            className="mappings_checkbox"
                            options={mappingsForSearch?.map((d, index) => {
                              return {
                                value: JSON.stringify({
                                  code: d.code,
                                  display: d.display,
                                  description: d.description,
                                  system: d.system,
                                }),
                                label: existingMappingDisplay(d, index),
                              };
                            })}
                            onChange={onExistingChange}
                          />
                        )}
                      </Form.Item>

                      {displaySelectedMappings?.length > 0 && (
                        <Form.Item
                          initialValue={initialCheckedSearch()}
                          name={['selected_mappings']}
                          valuePropName="value"
                          rules={[
                            {
                              required: false,
                            },
                          ]}
                        >
                          {displaySelectedMappings?.map((sm, i) => (
                            <Checkbox
                              key={i}
                              onChange={e => onCheckboxChange(e, sm.obo_id)}
                              checked={selectedBoxes.includes(sm.obo_id)}
                            >
                              {selectedTermsDisplay(sm, i)}
                            </Checkbox>
                          ))}
                        </Form.Item>
                      )}
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
                            options={filteredResultsArray?.map((d, index) => {
                              return {
                                value: JSON.stringify({
                                  code: d.obo_id,
                                  display: d.label,
                                  description: d.description[0],
                                  system: systemsMatch(
                                    d?.obo_id?.split(':')[0]
                                  ),
                                }),
                                label: newSearchDisplay(d, index),
                              };
                            })}
                            onChange={onSelectedChange}
                          />
                        )}
                      </Form.Item>
                    </Form>
                    <div>
                      {/* 'View More' pagination displaying the number of results being displayed
                      out of the total number of results. Because of the filter to filter out the duplicates,
                      there is a tooltip informing the user that redundant entries have been removed to explain any
                      inconsistencies in results numbers per page. */}
                      <Tooltip
                        placement="bottom"
                        title="Redundant entries have been removed"
                      >
                        Displaying {resultsCount}
                        &nbsp;of&nbsp;{totalCount}
                      </Tooltip>
                      {totalCount - filteredResultsCount !== resultsCount && (
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
                ) : (
                  <h3>No results found.</h3>
                )}
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
