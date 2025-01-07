import { ontologyReducer } from './Utility';

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
  vocabUrl,
  query,
  ontologiesToSearch,
  page,
  entriesPerPage,
  pageStart,
  selectedBoxes,
  // setTotalCount,
  setResults,
  // setFilteredResultsCount,
  setResultsCount,
  setLoading,
  results,
  setMoreAvailable
  // setFacetCounts
) => {
  setLoading(true);

  return fetch(
    `${vocabUrl}/ontology_search?keyword=${query}&selected_ontologies=${ontologiesToSearch}&selected_api=ols&results_per_page=${entriesPerPage}&start_index=${pageStart}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
    .then(res => res.json())
    .then(data => {
      // if the page > 0 (i.e. if this is not the first batch of results), the new results
      // are concatenated to the old
      if (selectedBoxes) {
        data.results = data.results.filter(
          d => !selectedBoxes.some(box => box.code === d.code)
        );
      }

      if (page > 0 && results?.length > 0) {
        data.results = results?.concat(data.results);
      }

      // Apply filtering to remove results with obo_id in selectedBoxes
      // } else {
      //   // Set the total number of search results for pagination
      //   setTotalCount(data.response.numFound);
      // }

      setResults(data.results);
      setMoreAvailable(data.more_results_available);
      // setFilteredResultsCount(
      //   prevState => prevState + res?.filteredResults?.length
      // );
      // // resultsCount is set to the length of the filtered, concatenated results for pagination
      setResultsCount(data?.results?.length);
      // setFacetCounts(data?.facet_counts?.facet_fields?.ontologyPreferredPrefix);
    })
    .finally(() => setLoading(false));
};

export const getFiltersByCode = (
  vocabUrl,
  mappingProp,
  setApiPreferencesCode,
  notification,
  setUnformattedPref,
  table,
  terminology,
  setLoading
) => {
  setLoading(true);
  return fetch(
    `${vocabUrl}/${
      table
        ? `Table/${table.id}/filter/${mappingProp}`
        : `Terminology/${terminology.id}/filter/${mappingProp}`
    }`,
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
        notification.error({
          message: 'Error',
          description: 'An error occurred loading the ontology preferences.',
        });
      }
    })
    .then(data => {
      setUnformattedPref(data);
      const codeToSearch = Object.keys(data)?.[0];

      const ols = data?.[codeToSearch]?.api_preference?.ols;

      if (Array.isArray(ols)) {
        // If ols in api_preference is an array, use it as is
        setApiPreferencesCode(ols.map(item => item.toUpperCase())); // Set state to the array
      } else if (typeof ols === 'string') {
        // If ols in api_preference is a string, split it into an array
        const splitOntologies = ols.toUpperCase().split(',');
        setApiPreferencesCode(splitOntologies); // Set state to the array
      } else {
        setApiPreferencesCode([]); // Fallback if no ols found
      }
    });
};

export const ontologyFilterCodeSubmit = (
  apiPreferencesCode,
  preferenceType,
  prefTypeKey,
  mappingProp,
  vocabUrl,
  table,
  terminology
) => {
  const apiPreference = { api_preference: { 'ols': [] } };
  if (
    apiPreferencesCode &&
    (!preferenceType[prefTypeKey]?.api_preference?.[0] ||
      JSON.stringify(
        Object.values(preferenceType[prefTypeKey]?.api_preference)[0]?.sort()
      ) !== JSON.stringify(apiPreferencesCode?.sort()))
  ) {
    apiPreference.api_preference.ols = apiPreferencesCode;
    const fetchUrl = `${vocabUrl}/${
      !table ? `Terminology/${terminology?.id}` : `Table/${table?.id}`
    }/filter/${mappingProp}`;
    fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPreference),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred saving the ontology preferences.',
          });
        }
      });
  }
};
