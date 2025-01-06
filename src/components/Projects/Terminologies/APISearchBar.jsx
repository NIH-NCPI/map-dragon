import { Input } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { ontologyReducer } from '../../Manager/Utilitiy';
import { SearchContext } from '../../../Contexts/SearchContext';

export const APISearchBar = ({
  active,
  setActive,
  searchProp,
  selectedBoxes,
  setLoading,
}) => {
  const { Search } = Input;
  const { searchUrl } = useContext(myContext);
  const {
    apiResults,
    setApiResults,
    setApiResultsCount,
    apiPage,
    setApiPage,
    setApiTotalCount,
  } = useContext(SearchContext);
  const [inputValue, setInputValue] = useState(searchProp);
  const entriesPerPage = 1000;
  const [currentSearchProp, setCurrentSearchProp] = useState(searchProp);
  const [filteredResultsCount, setFilteredResultsCount] = useState(0);

  const handleSearch = query => {
    setCurrentSearchProp(query);
    setApiPage(0);
  };

  const handleChange = e => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    if (!!currentSearchProp) {
      active === 'search' && fetchResults(apiPage, currentSearchProp);
    }
  }, [active, apiPage, currentSearchProp]);

  const fetchResults = (page, query) => {
    if (!!!query) {
      return undefined;
    }
    setLoading(true);
    /* The OLS API returns 10 results by default unless specified otherwise. The fetch call includes a specified
    number of results to return per page (entriesPerPage) and a calculation of the first index to start the results
    on each new batch of results (pageStart, calculated as the number of the page * the number of entries per page */
    const pageStart = apiPage * entriesPerPage;
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
        if (selectedBoxes) {
          res.results = res.results.filter(
            d => !selectedBoxes.some(box => box.obo_id === d.obo_id)
          );
        }

        if (apiPage > 0 && apiResults.length > 0) {
          res.results = apiResults.concat(res.results);

          // Apply filtering to remove results with obo_id in selectedBoxes
        } else {
          // Set the total number of search results for pagination
          setApiTotalCount(data.response.numFound);
        }

        //the results are set to res (the filtered, concatenated results)

        setApiResults(res.results);
        setFilteredResultsCount(res?.filteredResults?.length);
        // resultsCount is set to the length of the filtered, concatenated results for pagination
        setApiResultsCount(res.results.length);
      })
      .then(() => setLoading(false));
  };

  return (
    <div
      onClick={() => setActive('search')}
      className={active === 'search' ? 'active_term' : 'inactive_term'}
    >
      <Search
        onSearch={handleSearch}
        value={inputValue}
        onChange={handleChange}
      />
    </div>
  );
};
