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

export const handleUpdate = (vocabUrl, name, component) => {
  return fetch(`${vocabUrl}/${name}/${component.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(component),
  }).then(res => {
    if (res.ok) {
      return res.json();
    } else {
      throw new Error('An unknown error occurred.');
    }
  });
};

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
      throw new Error('An unknown error occurred.');
    }
  });
};
