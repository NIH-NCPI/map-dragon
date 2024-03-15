export const requestSearch = (query, rowCount, firstRowdescription) => {
  fetch(
    `${URL}q=${query}&ontology=mondo,hp&rows=${rowCount}&start=${firstRowdescription}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  ).then(res => {
    if (res.ok) {
      return res.json();
    } else {
      throw new Error('An unknown error occurred.');
    }
  });
};
