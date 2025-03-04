// Fetches all elements at an endpoint
export const getAll = (vocabUrl, name, navigate) => {
  return fetch(`${vocabUrl}/${name}`, {
    method: 'GET',
    credentials: 'include',
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
    credentials: 'include',
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
  const options = { method: 'DELETE', credentials: 'include' };

  if (name === 'Table' || name === 'Terminology') {
    options.headers = {
      'Content-Type': 'application/json',
    };
    // options.body = JSON.stringify({ editor: user.email });
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
    credentials: 'include',
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
    credentials: 'include',
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
    credentials: 'include',
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
    credentials: 'include',
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
    credentials: 'include',
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
  setResults,
  setResultsCount,
  setLoading,
  results,
  setMoreAvailable,
  apiToSearch,
  notification
) => {
  setLoading(true);

  return fetch(
    `${vocabUrl}/ontology_search?keyword=${query}&selected_ontologies=${ontologiesToSearch}&selected_api=${apiToSearch}&results_per_page=${entriesPerPage}&start_index=${pageStart}`,
    {
      method: 'GET',
      credentials: 'include',
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
          description: `An error occurred searching for ${query}.`,
        });
      }
    })
    .then(data => {
      // if the page > 0 (i.e. if this is not the first batch of results), the new results
      // are concatenated to the old
      if (selectedBoxes) {
        data.results = data?.results?.filter(
          d => !selectedBoxes.some(box => box.code === d.code)
        );
      }

      if (page > 0 && results?.length > 0) {
        data.results = results?.concat(data.results);
      }
      const addedApi = data?.results.map(result => ({
        ...result,
        api: apiToSearch,
      }));
      setResults(addedApi);
      setMoreAvailable(data.more_results_available);

      setResultsCount(data?.results?.length);
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
  setLoading,
  optionalTableParam
) => {
  setLoading(true);
  return fetch(
    `${vocabUrl}/${
      table
        ? `Table/${table.id}/filter/${mappingProp}`
        : `Terminology/${terminology.id}/filter/${mappingProp}${optionalTableParam}`
    }`,
    {
      method: 'GET',
      credentials: 'include',
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
      const apiPreferences =
        data[codeToSearch]?.api_preference ?? data[codeToSearch];
      const updatedPreferences = Object.entries(apiPreferences).reduce(
        (acc, [key, values]) => {
          acc[key] = values.map(value => value.toUpperCase());
          return acc;
        },
        {}
      );

      setApiPreferencesCode(updatedPreferences);
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
  const apiPreference = { api_preference: {} };
  if (
    apiPreferencesCode &&
    (!preferenceType[prefTypeKey]?.api_preference?.[0] ||
      JSON.stringify(
        Object.values(preferenceType[prefTypeKey]?.api_preference)[0]?.sort()
      ) !== JSON.stringify(apiPreferencesCode?.sort()))
  ) {
    apiPreference.api_preference = apiPreferencesCode;
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
export const getDefaultOntologies = async (vocabUrl) => {
  return fetch(`${vocabUrl}/user/preferences/ontologies`, {
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
