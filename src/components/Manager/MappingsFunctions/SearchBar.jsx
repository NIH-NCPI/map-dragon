import { Input } from 'antd';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { ontologyReducer } from '../Utilitiy';
const { Search } = Input;

export const SearchBar = ({ searchProp, entriesPerPage }) => {
  const { searchUrl } = useContext(myContext);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState();
  const [resultsCount, setResultsCount] = useState();
  const [lastCount, setLastCount] = useState(0); //save last count as count of the results before you fetch data again
  const [filteredResultsCount, setFilteredResultsCount] = useState(0);

  const onSearch = query => fetchSearchBar(page, query);

  const fetchSearchBar = (page, query) => {
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
      .then(() => setLoading(false));
  };

  return <Search onSearch={onSearch} defaultValue={searchProp} />;
};
