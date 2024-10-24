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
  setLoading,
  results,
  setFacetCounts
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
      setFacetCounts(data?.facet_counts?.facet_fields?.ontologyPreferredPrefix);
    })
    .finally(() => setLoading(false));
};

export const getFiltersByCode = (
  vocabUrl,
  component,
  mappingProp,
  setApiPreferencesCode,
  notification,
  apiPreferencesCode,
  setUnformattedPref,
  table
) => {
  return fetch(
    `${vocabUrl}/${
      component === table
        ? component?.terminology?.reference
        : `Terminology/${component?.id}`
    }/filter/${mappingProp}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
      setUnformattedPref(data);

      // Dynamically derive the mappingProp based on a condition or the structure of the data
      const codeToSearch = Object.keys(data)[0]; // Example: get the first key in the object
      if (data?.[codeToSearch]?.api_preference?.ols) {
        const joinedOntologies =
          data[codeToSearch].api_preference.ols.join(',');
        setApiPreferencesCode(joinedOntologies); // Set state to the comma-separated string
      } else {
        setApiPreferencesCode(''); // Fallback if no ols found
      }
    })
    .catch(error => {
      if (error) {
        notification.error({
          message: 'Error',
          description: 'An error occurred loading the ontology preferences.',
        });
      }
      return error;
    });
};
