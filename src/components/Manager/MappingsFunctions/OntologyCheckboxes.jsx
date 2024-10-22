import { Checkbox, Form } from 'antd';
import { ontologyCounts } from '../Utilitiy';
import { useContext, useEffect, useState } from 'react';
import { SearchContext } from '../../../Contexts/SearchContext';

export const OntologyCheckboxes = ({ apiPreferences }) => {
  const { apiPreferencesCode, setApiPreferencesCode, facetCounts } =
    useContext(SearchContext);
  const [checkedOntologies, setCheckedOntologies] = useState([]);

  const defaultOntologies = ['mondo', 'hp', 'maxo', 'ncit'];
  const existingOntologies = apiPreferencesCode
    ? apiPreferencesCode
    : apiPreferences &&
      apiPreferences?.self &&
      apiPreferences?.self?.api_preference
    ? Object?.values(apiPreferences?.self?.api_preference).flat()
    : defaultOntologies;

  useEffect(() => {
    setCheckedOntologies(existingOntologies);
  }, [apiPreferences]);

  console.log('default', defaultOntologies);
  console.log('exsiting', existingOntologies);
  console.log('checked', checkedOntologies);

  const onCheckboxChange = e => {
    const { value, checked } = e.target;

    setCheckedOntologies(existingOntologies => {
      // Ensure existingOntologies is always an array
      const newCheckedOntologies = Array.isArray(existingOntologies)
        ? checked
          ? [...existingOntologies, value] // Add value if checked
          : existingOntologies.filter(key => key !== value) // Remove value if unchecked
        : []; // Fallback to an empty array if it's not an array

      // Update apiPreferencesCode
      setApiPreferencesCode(existingCode => {
        if (checked) {
          // Add value if checked, and avoid duplications
          return existingCode ? `${existingCode},${value}` : value;
        } else {
          // Remove value if unchecked, handling cases where the string might be empty
          const updatedCode = existingCode
            .split(',')
            .filter(code => code !== value) // Remove the unchecked value
            .join(',');

          // Ensure there's no trailing comma
          return updatedCode.replace(/,$/, '');
        }
      });

      return newCheckedOntologies;
    });
  };

  const formattedFacetCounts = ontologyCounts(facetCounts);

  const existingOntologiesArray = Array.isArray(existingOntologies)
    ? existingOntologies
    : [];

  const checkedOntologiesArray = Array.isArray(checkedOntologies)
    ? checkedOntologies
    : [];
  // Sort the `formattedFacetCounts` before rendering, not inside the `map()`
  const sortedFacetCounts = formattedFacetCounts?.sort(
    (a, b) =>
      (existingOntologiesArray?.includes(Object.keys(a)[0]) ? -1 : 1) -
      (existingOntologiesArray?.includes(Object.keys(b)[0]) ? -1 : 1)
  );

  return (
    <div className="ontology_form">
      <Form.Item
        name="selected_ontologies"
        valuePropName="value"
        rules={[{ required: false }]}
      >
        <div className="modal_display_results">
          {sortedFacetCounts?.map((fc, i) => {
            const key = Object.keys(fc)[0];
            const value = fc[key];
            formattedFacetCounts.sort(
              (a, b) =>
                (existingOntologiesArray?.includes(Object.keys(a)[0])
                  ? -1
                  : 1) -
                (existingOntologiesArray?.includes(Object.keys(b)[0]) ? -1 : 1)
            );

            return (
              <Checkbox
                key={i}
                value={key}
                checked={checkedOntologiesArray?.includes(key)} // Check if key is in checkedOntologies array
                onChange={onCheckboxChange}
              >
                {`${key.toUpperCase()} ${value !== '0' ? `(${value})` : ''}`}
              </Checkbox>
            );
          })}
        </div>
      </Form.Item>
    </div>
  );
};
