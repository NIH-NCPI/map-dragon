import { useEffect, useRef, useState, useContext } from 'react';
import { Pagination, notification } from 'antd';
import { myContext } from '../../App';
import { useNavigate, useParams } from 'react-router-dom';
import './SearchResults.scss';
import Background from '../../assets/Background.png';
import { SearchSpinner } from '../Manager/Spinner';

export const SearchResults = () => {
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const { results, setResults, searchUrl } = useContext(myContext);

  const [page, setPage] = useState(1); //page number for search results pagination
  /* useParams() gets the search term param from the address bar, 
  which was placed there from the input field in OntologySearch.jsx */
  const [rows, setRows] = useState(20); //number of rows displayed in each page of search results
  const [current, setCurrent] = useState(1); //the page of search results currently displayed
  const [loading, setLoading] = useState(true);
  const { query } = useParams();
  const navigate = useNavigate();
  const ref = useRef();

  // sets the page and current page to the page number of the paginator
  const onChange = page => {
    setCurrent(page);
    setPage(page);
  };

  /* updates the number of rows on the result page and the current page displayed 
  if user changes the number of results displayed per page */
  const onShowSizeChange = (current, rows) => {
    setCurrent(current);
    setRows(rows);
  };

  // calls the search function when there is a change in the rows, page, or query
  useEffect(() => {
    descriptionResults(rows, page);
  }, [rows, page, query]);

  // defines parameters for the search function. rows = the number of results returned in the search
  // the OLS API specifies index number of the search result to start the return for each page of results
  // index begins at 0. (page - 1) * rows calculates the index number of the first result to be displayed on each page
  const descriptionResults = (rows, page) => {
    return requestSearch(rows, (page - 1) * rows);
  };

  // API request to OLS ontology search with the rows and index of the first search per page as props.
  // The response is set to the 'results'. Loading is set to false.
  const requestSearch = (rowCount, firstRowStart) => {
    setLoading(true);
    fetch(
      `${searchUrl}q=${query}&ontology=mondo,hp,maxo,ncit&rows=${rowCount}&start=${firstRowStart}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(res => res.json())
      .then(data => setResults(data.response))
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

  /* if the input field has a value (i.e. term being searched), the value is transposed into the address bar. 
The user is then redirected to the search page, which completes the search for the search term.*/
  const searchOnEnter = e => {
    if (e.key === 'Enter') {
      if (ref.current.value) {
        setPage(1), setCurrent(1), navigate(`/search/${ref.current.value}`);
      }
    }
  };
  return (
    <>
      <div className="results_page_container">
        <div className="search_field_container">
          {/* background image */}
          <div className="image_container">
            <img className="background_image_results" src={Background} />
          </div>
          <div className="search_field_results">
            <div className="text_input_results">
              <input
                id="search_input_results"
                type="text"
                placeholder="Search"
                defaultValue={query}
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
                    setPage(1),
                      setCurrent(1),
                      navigate(`/search/${ref.current.value}`);
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
                {results?.docs?.length > 0 ? (
                  results?.docs.map((d, index) => {
                    return (
                      <>
                        <div key={index} className="search_result">
                          <div className="term_ontology">
                            <div>
                              <b>{d.label}</b>
                            </div>
                            <div>{d.obo_id}</div>
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
        {loading === false && results?.numFound > 0 ? (
          <div className="pagination">
            <Pagination
              defaultCurrent={1} //default current page is 1
              defaultPageSize={rows} //default number of results per page is the value of 'rows'
              total={results?.numFound} //total number of results is from the 'numFound' property in the results
              onChange={onChange}
              current={current}
              onShowSizeChange={onShowSizeChange}
              showTotal={
                (total, range) => `${range[0]}-${range[1]} of ${total} items` //displays the range of results out of the total number of results
              }
            />
          </div>
        ) : (
          ''
        )}
      </div>
    </>
  );
};
