// Function that takes in a string and a number value.
// It truncates the string to the specified number of characters, then displays an ellipsis
export const ellipsisString = (str, num) => {
  if (typeof str == 'string' && str.length > num) {
    return str.slice(0, num) + '...';
  } else {
    return str;
  }
};

/* The results from the API sometimes show duplicate entries for codes that were imported from other ontologies.
  We only want to display the codes from their source ontologies, not the imported duplicates. This function ensures the
  curie in the code id matches the ontology prefix of the object. */
export const ontologyFilter = d =>
  d.filter(d => d?.obo_id.split(':')[0] === d?.ontology_prefix);

export const ontologyReducer = d =>
  d.reduce(
    (acc, item) => {
      if (item?.obo_id?.split(':')[0] === item?.ontology_prefix) {
        acc.results.push(item);
      } else {
        acc.filteredResults.push(item);
      }
      return acc;
    },
    { results: [], filteredResults: [] }
  );

/* The backend API does not yet have a way to affix the system URL to each ontology. 
  This displays the system for each ontology searched. */
export const ontologySystems = {
  MONDO: 'http://purl.obolibrary.org/obo/mondo.owl',
  HP: 'http://purl.obolibrary.org/obo/hp.owl',
  MAXO: 'http://purl.obolibrary.org/obo/maxo.owl',
  NCIT: 'http://purl.obolibrary.org/obo/ncit.owl',
};

// This function matches the ontology prop to its system (listed in object above) in the object that will be sent to the API
export const systemsMatch = ont => {
  return ontologySystems[ont];
};

// Iterates over the facet counts in the result to make an object of search results per ontology
export const ontologyCounts = arr => {
  let result = [];
  let i = 0;

  while (i < arr.length) {
    if (isNaN(arr[i])) {
      // If element in array, it not a number (i.e. it's a string), it sets it as the key
      const key = arr[i];
      const value = arr[i + 1]; // Gets the first number after the string
      result.push({ [key]: value }); // Pushes the key (string) and value (number) pair to the result array
      i += 2; // Moves to the next letter-number pair
    } else {
      i += 1; // If the element is a number, it keeps going until it starts over and finds a string
    }
  }

  return result;
};
