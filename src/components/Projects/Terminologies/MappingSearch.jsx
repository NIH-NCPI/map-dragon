import { Checkbox, Form, Tooltip } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { myContext } from '../../../App';
import {
  ellipsisString,
  ontologyReducer,
  systemsMatch,
} from '../../Manager/Utilitiy';
import { ModalSpinner } from '../../Manager/Spinner';
import { MappingContext } from '../../../MappingContext';

export const MappingSearch = ({
  editMappings,
  setEditMappings,
  form,
  mappingsForSearch,
  reset,
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

  const { setExistingMappings, setFilteredMappings } =
    useContext(MappingContext);

  let ref = useRef();

  const onExistingChange = checkedValues => {
    setExistingMappings(checkedValues);
  };

  const onFilteredChange = checkedvalues => {
    setFilteredMappings(checkedvalues);
  };

  // since the code is passed through editMappings, the '!!' forces it to be evaluated as a boolean.
  // if there is a code being passed, it evaluates to true and runs the search function.
  // The function is run when the page changes and when the code changes.
  useEffect(() => {
    if (!!editMappings) {
      fetchResults(page);
    }
  }, [page, editMappings]);

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
    },
    []
  );

  // The function that makes the API call to search for the passed code.
  const fetchResults = page => {
    if (!!!editMappings) {
      return undefined;
    }
    setLoading(true);

    /* The OLS API returns 10 results by default unless specified otherwise. The fetch call includes a specified
    number of results to return per page (entriesPerPage) and a calculation of the first index to start the results
    on each new batch of results (pageStart, calculated as the number of the page * the number of entries per page */
    const pageStart = page * entriesPerPage;
    return fetch(
      `${searchUrl}q=${searchProp}&ontology=mondo,hp,maxo,ncit&rows=${entriesPerPage}&start=${pageStart}`,
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
    setPage(page + 1);
  };

  const viewMorePagination = (
    <span
      className="view_more_link"
      onClick={e => {
        handleViewMore(e);
        // the lastCount being set to resultsCount prior to fetching the next batch of results
        setLastCount(resultsCount);
      }}
    >
      View More
    </span>
  );

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
            <div>{ellipsisString(d?.description?.[0], '100')}</div>
          </div>
        </div>
      </>
    );
  };

  // Iteratesw through the array of previously selected mappings. Returns a JSON stringified object that is pushed to a separate array.
  // That array is returned to use as default checked values separate from the search results.
  const initialChecked = () => {
    let initialMappings = [];

    mappingsForSearch.forEach((m, index) => {
      const val = JSON.stringify({
        code: m?.code,
        display: m?.display,
        // description: m.description[0],
        system: m?.system,
      });
      initialMappings.push(val);
    });
    return initialMappings;
  };

  // Sets existingMappings to the mappings that have already been mapped to pass them to the body of the PUT call on save.
  useEffect(() => {
    setExistingMappings(mappingsForSearch);
  }, []);

  // Creates a Set that excludes the mappings that have already been selected.
  // Then filteres the existing mappings out of the results to only display results that have not yet been selected.
  const filteredResults = () => {
    const codesToExclude = new Set(mappingsForSearch.map(m => m.code));
    const updatedResults = results.filter(r => !codesToExclude.has(r.obo_id));
    return updatedResults;
  };
  const filteredResultsArray = filteredResults();

  return (
    <>
      <div className="results_modal_container">
        <>
          {loading === false ? (
            <>
              <div className="modal_search_results">
                <div className="modal_search_results_header">
                  <h3>Search results for: {editMappings?.code}</h3>
                </div>
                {/* ant.design form displaying the checkboxes with the search results.  */}
                {results?.length > 0 ? (
                  <div className="result_container">
                    <Form form={form} layout="vertical">
                      <Form.Item
                        // If it is NOT in reset state (i.e. edit mode), default values are checked. If reset is set, default values are blank, since all values were deleted.
                        initialValue={!reset ? initialChecked() : null}
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
                                  // description: d.description[0],
                                  system: d.system,
                                }),
                                label: existingMappingDisplay(d, index),
                              };
                            })}
                            onChange={onExistingChange}
                          />
                        )}
                      </Form.Item>

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
                                  // description: d.description[0],
                                  system: systemsMatch(
                                    d?.obo_id?.split(':')[0]
                                  ),
                                }),
                                label: newSearchDisplay(d, index),
                              };
                            })}
                            onChange={onFilteredChange}
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
                      {totalCount - filteredResultsCount !== resultsCount &&
                        viewMorePagination}
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
