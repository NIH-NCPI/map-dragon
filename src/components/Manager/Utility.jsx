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

// This function matches the ontology prop to its system in the object that will be sent to the API
export const systemsMatch = (ontologyCode, ontologyApis) => {
  // Searches for the ontology that contains the requested ontology code
  const ontologyApi = ontologyApis.find(
    api => api.ontologies[ontologyCode?.toLowerCase()]
  );
  if (ontologyApi) {
    // Return the system URL for the matching ontology
    return ontologyApi.ontologies[ontologyCode?.toLowerCase()].system;
  }
  return null; // If not found, return null or handle accordingly
};

// Iterates over the facet counts in the result to make an object of search results per ontology
export const ontologyCounts = arr => {
  let result = [];
  let i = 0;

  while (i < arr.length) {
    if (isNaN(arr[i])) {
      // If element in array, is not a number (i.e. it's a string), it sets it as the key
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

export const cleanedName = data => data?.toLowerCase().replaceAll(' ', '_');

export const mappingTooltip = code => {
  return (
    <>
      <div className="mapping_tooltip">
        <div>{code.code}</div>
        <div>{code?.display}</div>
      </div>
    </>
  );
};

// Shortened display for mapping relationships in tables
export const relationshipDisplay = variable =>
  variable?.mapping_relationship === 'equivalent'
    ? '(equivalent)'
    : variable.mapping_relationship === 'source-is-narrower-than-target'
    ? '(narrower)'
    : variable?.mapping_relationship === 'source-is-broader-than-target'
    ? '(broader)'
    : '';
