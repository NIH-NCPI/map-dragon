import { ontologyReducer } from './Utilitiy';

// Fetches all elements at an endpoint
export const getAll = (vocabUrl, name, navigate) => {
  return fetch(`${vocabUrl}/${name}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => {
    if (res.ok) {
      return res.json();
    } else if (res.status === 404) {
      navigate('/404');
    } else {
      return res.json().then(error => {
        throw new Error(error);
      });
    }
  });
};

// Fetches one element by its id
export const getById = async (vocabUrl, name, id, navigate) => {
  return fetch(`${vocabUrl}/${name}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else if (res.status === 404) {
        navigate('/404');
      } else {
        return res.json().then(error => {
          throw new Error(error);
        });
      }
    })
    .catch(err => {
      navigate('/404');
    });
};

// Deletes one element by its id
export const handleDelete = (evt, vocabUrl, name, component, user) => {
  const options = { method: 'DELETE' };

  if (name === 'Table' || name === 'Terminology') {
    options.headers = {
      'Content-Type': 'application/json',
    };
    options.body = JSON.stringify({ editor: user.email });
  }
  return fetch(`${vocabUrl}/${name}/${component.id}`, options)
    .then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.message || 'An error occurred.');
        });
      }
      return response.json();
    })
    .then(() => {
      return fetch(`${vocabUrl}/${name}`);
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(error => {
          throw new Error(
            error.message || 'Error occurred while fetching updated data'
          );
        });
      }
      return res.json();
    });
};

// Updates one element by its id.
export const handleUpdate = (vocabUrl, name, component, values) => {
  return fetch(`${vocabUrl}/${name}/${component.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  }).then(res => {
    if (res.ok) {
      return res.json();
    } else {
      return res.json().then(error => {
        throw new Error(error);
      });
    }
  });
};

// Posts a new element to an endpoint.
export const handlePost = (vocabUrl, name, body) => {
  return fetch(`${vocabUrl}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(res => {
    if (res.ok) {
      return res.json();
    } else {
      return res.json().then(error => {
        throw new Error(error);
      });
    }
  });
};

export const handlePatch = (vocabUrl, name, component, body) => {
  return fetch(`${vocabUrl}/${name}/${component.id}/rename`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(res => {
    if (res.ok) {
      return res.json();
    } else {
      return res.json().then(error => {
        throw new Error(error);
      });
    }
  });
};

export const getProvenanceByCode = async (vocabUrl, name, id, code) => {
  return fetch(`${vocabUrl}/Provenance/${name}/${id}/code/${code}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => {
    if (res.ok) {
      return res.json();
    } else {
      return res.json().then(error => {
        throw new Error(error);
      });
    }
  });
};

export const getOntologies = vocabUrl => {
  return fetch(`${vocabUrl}/OntologyAPI`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => {
    if (res.ok) {
      return res.json();
    } else {
      return res.json().then(error => {
        throw new Error(error);
      });
    }
  });
};

export const olsFilterOntologiesSearch = (
  searchUrl,
  query,
  ontologiesToSearch,
  page,
  entriesPerPage,
  pageStart,
  selectedBoxes,
  setTotalCount,
  setResults,
  setFilteredResultsCount,
  setResultsCount,
  setLoading
) => {
  setLoading(true);
  return fetch(
    `${searchUrl}q=${query}&ontology=${ontologiesToSearch}&rows=${entriesPerPage}&start=${pageStart}`,
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

      if (page > 0 && results.length > 0) {
        res.results = results.concat(res.results);

        // Apply filtering to remove results with obo_id in selectedBoxes
      } else {
        // Set the total number of search results for pagination
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
