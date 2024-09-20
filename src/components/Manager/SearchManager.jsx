// Function that performs the search using the OLS API
export const requestSearch = (
  searchUrl,
  query,
  rowCount,
  firstRowdescription
) => {
  fetch(
    `${searchUrl}q=${query}&ontology=mondo,hp,maxo,ncit&rows=${rowCount}&start=${firstRowdescription}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  ).then(res => {
    if (res.ok) {
      return res.json();
    } else {
      throw new Error('An unknown error occurred.');
    }
  });
};
