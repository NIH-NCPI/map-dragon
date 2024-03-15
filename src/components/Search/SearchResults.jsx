import { useEffect, useRef, useState, useContext } from 'react';
import { Pagination } from 'antd';
import { myContext } from '../../App';
import { useNavigate, useParams } from 'react-router-dom';
import './SearchResults.scss';
import Background from '../../assets/Background.png';
import { Spinner } from '../Manager/Spinner';

export const SearchResults = () => {
  const {
    results,
    setResults,
    page,
    setPage,
    rows,
    setRows,
    current,
    setCurrent,
    buttonDisabled,
    setButtonDisabled,
    loading,
    setLoading,
    searchUrl,
  } = useContext(myContext);

  const { query } = useParams();
  const navigate = useNavigate();
  const ref = useRef();

  const onChange = page => {
    setCurrent(page);
    setPage(page);
  };

  const onShowSizeChange = (current, rows) => {
    setCurrent(current);
    setRows(rows);
  };

  useEffect(() => {
    descriptionResults(rows, page);
  }, [rows, page, query]);

  const descriptionResults = (rows, page) => {
    return requestSearch(rows, (page - 1) * rows);
  };

  const requestSearch = (rowCount, firstRowDescription) => {
    setLoading(true);
    fetch(
      `${searchUrl}q=${query}&ontology=mondo,hp,maxo,ncit&rows=${rowCount}&start=${firstRowDescription}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(res => res.json())
      .then(data => setResults(data.response))
      .then(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div className="results_page_container">
        <div className="search_field_container">
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
                  if (e.key === 'Enter') {
                    if (ref.current.value) {
                      setPage(1),
                        setCurrent(1),
                        navigate(`/search/${ref.current.value}`);
                    }
                  }
                }}
                onChange={e => {
                  e.target.value === ''
                    ? setButtonDisabled(true)
                    : setButtonDisabled(false);
                }}
              />
            </div>

            <div>
              <button
                className={`search_button_results ${
                  buttonDisabled ? 'disabled_results' : ''
                }`}
                onClick={e => {
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
          {loading === false ? (
            <>
              {' '}
              <div className="search_results">
                <div className="search_results_header">
                  <h2>Search results for: {query}</h2>
                </div>
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
                  <h4>No results found.</h4>
                )}
              </div>
            </>
          ) : (
            <div className="loading_spinner">
              <Spinner />
            </div>
          )}
        </>

        {loading === false && results?.numFound > 0 ? (
          <div className="pagination">
            <Pagination
              defaultCurrent={1}
              defaultPageSize={rows}
              total={results?.numFound}
              onChange={onChange}
              current={current}
              onShowSizeChange={onShowSizeChange}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
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
