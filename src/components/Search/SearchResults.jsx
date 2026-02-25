import { useEffect, useRef, useState, useContext } from 'react';
import { notification } from 'antd';
import { myContext } from '../../App';
import { useNavigate, useParams } from 'react-router-dom';
import './SearchResults.scss';
import { SearchSpinner } from '../Manager/Spinner';
import { SearchContext } from '../../Contexts/SearchContext';
import { cleanedSearchTerm, uriEncoded } from '../Manager/Utility';

export const SearchResults = () => {
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const {
    entriesPerPage,
    moreAvailable,
    setMoreAvailable,
    resultsCount,
    setResultsCount,
    defaultOntologies,
    page,
    setPage
  } = useContext(SearchContext);
  const { results, setResults, vocabUrl } = useContext(myContext);

  const [loading, setLoading] = useState(true);
  const [lastCount, setLastCount] = useState(0); //save last count as count of the results before you fetch data again

  /* useParams() gets the search term param from the address bar, 
  which was placed there from the input field in OntologySearch.jsx */
  const { query } = useParams();
  const navigate = useNavigate();
  const ref = useRef();
  const pageref = useRef();
  const pageStart = page * entriesPerPage;

  useEffect(() => {
    document.title = 'Map Dragon';
  }, []);

  // calls the search function when there is a change in the rows, page, or query
  useEffect(() => {
    requestSearch();
  }, [page, query]);

  useEffect(() => {
    if (results?.length > 0 && page > 0 && pageref.current) {
      const container = pageref.current.closest('.search_result');
      const scrollTop = pageref.current.offsetTop - container.offsetTop;
      container.scrollTop = scrollTop;
    }
  }, [results]);

  // API request to OLS ontology search with the rows and index of the first search per page as props.
  // The response is set to the 'results'. Loading is set to false.
  const requestSearch = () => {
    setLoading(true);
    fetch(
      `${vocabUrl}/ontology_search?keyword=${uriEncoded(
        cleanedSearchTerm(query)
      )}&selected_ontologies=${defaultOntologies.join()}&selected_api=ols&results_per_page=${entriesPerPage}&start_index=${pageStart}`,
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
        } else {
          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.'
          });
        }
      })
      .then(data => {
        if (page > 0 && results?.length > 0) {
          data.results = results?.concat(data.results);
        }

        setResults(data.results);
        setMoreAvailable(data.more_results_available);

        setResultsCount(data?.results?.length);
      })
      .finally(() => setLoading(false));
  };

  /* if the input field has a value (i.e. term being searched), the value is transposed into the address bar. 
The user is then redirected to the search page, which completes the search for the search term.*/
  const searchOnEnter = e => {
    if (e.key === 'Enter') {
      if (ref.current.value) {
        (setPage(0), navigate(`/search/${ref.current.value}`));
      }
    }
  };

  const handleViewMore = e => {
    e.preventDefault();
    setPage(prevPage => prevPage + 1);
  };

  return (
    <>
      <div className="results_page_container">
        <div className="search_field_container">
          <div className="search_field_results">
            <div className="text_input_results">
              <input
                id="search_input_results"
                type="text"
                placeholder="Search"
                defaultValue={cleanedSearchTerm(query)}
                ref={ref}
                onKeyDown={e => {
                  searchOnEnter(e);
                }}
                // if there is no value in the input field, the search button is disabled.
                onChange={e => setButtonDisabled(e.target.value === '')}
              />
            </div>

            <div>
              <button
                className={`search_button_results ${
                  buttonDisabled ? 'disabled_results' : ''
                }`}
                onClick={e => {
                  /* if the input field has a value (i.e. term being searched):
                 the page of search results is set to 1 to fetch the results of the first page
                 the current page displayed is set to 1
                 the value is transposed into the address bar
                  */
                  if (ref.current.value) {
                    (setPage(0), navigate(`/search/${ref.current.value}`));
                  }
                }}
              >
                SEARCH
              </button>
            </div>
          </div>
        </div>

        <>
          {/* if loading has finished, the results are displayed*/}
          {loading === false ? (
            <>
              {' '}
              <div className="search_results">
                <div className="search_results_header">
                  {/* Text that displays the term being searched, obtained from the address bar through the "query" param */}
                  <h2>Search results for: {query}</h2>
                </div>
                {/* if the length of the results array is greater than 0 (i.e. there is a return with results for the search term),
                the results are displayed. */}
                {results?.length > 0 ? (
                  results?.map((d, index) => {
                    return (
                      <>
                        <div
                          key={index}
                          pageref={
                            index === lastCount + 1 ? pageref : undefined
                          }
                          className="search_result"
                        >
                          <div className="term_ontology">
                            <div>
                              <b>{d.display}</b>
                            </div>
                            <div>
                              <a href={d.code_iri} target="_blank">
                                {d.code}
                              </a>
                            </div>
                          </div>
                          <div>{d.description}</div>
                          <div>Ontology: {d.ontology_prefix}</div>
                        </div>
                      </>
                    );
                  })
                ) : (
                  /* if the length of the results array is not greater than 0 (i.e. there are no results found for the search term),
                the "No results found" is displayed */
                  <h4>No results found.</h4>
                )}
              </div>
            </>
          ) : (
            /* if the search results are still loading, the loading spinner is displayed */
            <div className="loading_spinner">
              <SearchSpinner />
            </div>
          )}
        </>
        {/* if loading has completed and search results were found, the paginator is displayed */}
        {moreAvailable && (
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
    </>
  );
};
