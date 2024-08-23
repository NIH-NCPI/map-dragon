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
