import { Checkbox, Form, Input } from 'antd';
import { ontologyCounts } from '../Utilitiy';
import { useContext, useEffect, useState } from 'react';
import { SearchContext } from '../../../Contexts/SearchContext';
import './MappingsFunctions.scss';

export const OntologyCheckboxes = ({ preferenceType }) => {
  const {
    apiPreferencesCode,
    setApiPreferencesCode,
    facetCounts,
    ontologyApis,
    prefTypeKey,
  } = useContext(SearchContext);
  const { Search } = Input;

  const [checkedOntologies, setCheckedOntologies] = useState([]);
  const [searchText, setSearchText] = useState('');

  const defaultOntologies = ['mondo', 'hp', 'maxo', 'ncit'];

  let processedApiPreferencesCode;

  // Ensures the data sent to the API is in the correct format.
  // If apiPreferencesCode is an array, sets processedApiPreferencesCode equal to it.
  // If it is a comma-separated string, it splits it by the commas and adds them to an array
  if (Array.isArray(apiPreferencesCode)) {
    processedApiPreferencesCode = apiPreferencesCode;
  } else if (typeof apiPreferencesCode === 'string') {
    processedApiPreferencesCode = apiPreferencesCode.split(',');
  }

  const existingOntologies = apiPreferencesCode
    ? processedApiPreferencesCode
    : preferenceType &&
      preferenceType[prefTypeKey] &&
      preferenceType[prefTypeKey]?.api_preference
    ? Object?.values(preferenceType[prefTypeKey]?.api_preference).flat()
    : defaultOntologies;

  useEffect(() => {
    setCheckedOntologies(existingOntologies);
  }, [preferenceType]);

  const onCheckboxChange = e => {
    const { value, checked } = e.target;

    setCheckedOntologies(existingOntologies => {
      const newCheckedOntologies = Array.isArray(existingOntologies)
        ? checked
          ? [...existingOntologies, value]
          : existingOntologies.filter(key => key !== value)
        : [];

      setApiPreferencesCode(newCheckedOntologies);

      return newCheckedOntologies;
    });
  };

  const formattedFacetCounts = ontologyCounts(facetCounts);

  const sortedData = ontologyApis.map(api => {
    const sortedOntologies = Object.fromEntries(
      Object.entries(api.ontologies).sort((a, b) =>
        a[1].ontology_code > b[1].ontology_code ? 1 : -1
      )
    );

    return {
      ...api,
      ontologies: sortedOntologies,
    };
  });

  const countsMap = formattedFacetCounts.reduce((acc, item) => {
    const key = Object.keys(item)[0];
    acc[key] = parseInt(item[key], 10);
    return acc;
  }, {});

  // Build the new data structure
  const countsResult = Object.keys(sortedData[0]?.ontologies).map(key => {
    return { [key]: countsMap[key] || 0, api: sortedData[0]?.api_id };
  });

  const checkedOntologiesArray = Array.isArray(checkedOntologies)
    ? checkedOntologies
    : [];

  const getFilteredItems = searchText => {
    const filtered = countsResult?.filter(item => {
      const key = Object.keys(item)[0];
      return key.startsWith(searchText);
    });
    return filtered;
  };

  return (
    <div className="ontology_form">
      <Search
        placeholder="Ontologies"
        className="onto_search_bar"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
      />
      <Form.Item
        name="selected_ontologies"
        valuePropName="value"
        rules={[{ required: false }]}
      >
        <div className="modal_display_results">
          {getFilteredItems(searchText)
            ?.sort((a, b) => {
              const aValue = Object.values(a)[0];
              const bValue = Object.values(b)[0];
              return bValue - aValue;
            })
            .map((fc, i) => {
              const key = Object.keys(fc)[0];
              const value = fc[key];
              return (
                <Checkbox
                  key={i}
                  value={key}
                  checked={checkedOntologiesArray?.includes(key)}
                  onChange={onCheckboxChange}
                >
                  {`${key.toUpperCase()} ${value !== 0 ? `(${value})` : ''}`}
                </Checkbox>
              );
            })}
        </div>
      </Form.Item>
    </div>
  );
};
