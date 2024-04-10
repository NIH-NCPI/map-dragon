// Fetches all elements at an endpoint
export const getAll = (vocabUrl, name) => {
  return fetch(`${vocabUrl}/${name}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => {
    if (res.ok) {
      return res.json();
    } else {
      throw new Error('An unknown error occurred.');
    }
  });
};

// Fetches one element by its id
export const getById = (vocabUrl, name, id) => {
  return fetch(`${vocabUrl}/${name}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => {
    if (res.ok) {
      return res.json();
    } else {
      throw new Error('An unknown error occurred.');
    }
  });
};

// Deletes one element by its id
export const handleDelete = (evt, vocabUrl, name, component) => {
  return fetch(`${vocabUrl}/${name}/${component.id}`, {
    method: 'DELETE',
  })
    .then(response => response.json())
    .then(() => {
      return fetch(`${vocabUrl}/${name}`);
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error('An unknown error occurred.');
      }
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
      throw new Error('An unknown error occurred.');
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
  }).then(res => res.json());
};
