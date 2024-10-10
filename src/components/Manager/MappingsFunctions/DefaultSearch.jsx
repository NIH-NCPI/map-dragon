import { ontologyReducer } from '../Utilitiy';

export const fetchResults = (
  page,
  query,
  entriesPerPage,
  //   setLoading,
  setTotalCount,
  setResults,
  setFilteredResultsCount,
  setResultsCount,
  searchUrl,
  selectedBoxes
) => {
  if (!query) {
    return undefined;
  }
  //   setLoading(true);
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
      let res = ontologyReducer(data?.response?.docs);

      // Filter based on selectedBoxes
      if (selectedBoxes) {
        res.results = res.results.filter(
          d => !selectedBoxes.some(box => box.obo_id === d.obo_id)
        );
      }

      if (page > 0 && res.results.length > 0) {
        res.results = results.concat(res.results);
      } else {
        setTotalCount(data.response.numFound);
      }

      setResults(res.results);
      setFilteredResultsCount(res?.filteredResults?.length);
      setResultsCount(res.results.length);
    });
  // .finally(() => setLoading(false));
};
