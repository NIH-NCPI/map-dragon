import { Checkbox, Form } from 'antd';
import { ontologyCounts } from '../Utilitiy';
import { useContext, useEffect, useState } from 'react';
import { SearchContext } from '../../../Contexts/SearchContext';

export const OntologyCheckboxes = ({ apiPreferences }) => {
  const {
    apiPreferencesCode,
    setApiPreferencesCode,
    facetCounts,
    ontologyApis,
    component,
  } = useContext(SearchContext);
  const [checkedOntologies, setCheckedOntologies] = useState([]);

  const defaultOntologies = ['mondo', 'hp', 'maxo', 'ncit'];

  let processedApiPreferencesCode;

  if (Array.isArray(apiPreferencesCode)) {
    processedApiPreferencesCode = apiPreferencesCode;
  } else if (typeof apiPreferencesCode === 'string') {
    processedApiPreferencesCode = apiPreferencesCode.split(',');
  }

  const existingOntologies = apiPreferencesCode
    ? processedApiPreferencesCode
    : apiPreferences &&
      apiPreferences?.self &&
      apiPreferences?.self?.api_preference
    ? Object?.values(apiPreferences?.self?.api_preference).flat()
    : defaultOntologies;

  useEffect(() => {
    setCheckedOntologies(existingOntologies);
  }, [apiPreferences]);

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

  // console.log('sorted', sortedData);
  // console.log('ontologyapi', ontologyApis);
  console.log('pref', Object.values(apiPreferences?.self?.api_preference));
  // console.log('code', apiPreferencesCode);
  console.log('default', defaultOntologies);
  console.log('checked onts', checkedOntologies);

  const countsMap = formattedFacetCounts.reduce((acc, item) => {
    const key = Object.keys(item)[0];
    acc[key] = parseInt(item[key], 10);
    return acc;
  }, {});

  // // Build the new data structure
  const countsResult = Object.keys(sortedData[0].ontologies).map(key => {
    return { [key]: countsMap[key] || 0, api: sortedData[0]?.api_id };
  });

  const checkedOntologiesArray = Array.isArray(checkedOntologies)
    ? checkedOntologies
    : [];

  return (
    <div className="ontology_form">
      <Form.Item
        name="selected_ontologies"
        valuePropName="value"
        rules={[{ required: false }]}
      >
        <div className="modal_display_results">
          {countsResult
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
