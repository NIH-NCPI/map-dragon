import { Checkbox, Form, Input, Radio } from 'antd';
import { ontologyCounts } from '../Utility';
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
    active,
    prefTerminologies,
    checkedOntologies,
    setCheckedOntologies,
    unformattedPref,
    selectedApi,
    setSelectedApi,
  } = useContext(SearchContext);
  const { Search } = Input;

  let allApiPreferences = {};

  const codeToSearch = Object.keys(unformattedPref)?.[0];
  const apiPreferences =
    unformattedPref[codeToSearch]?.api_preference ??
    unformattedPref[codeToSearch];
  const apiPreferenceKeys = Object.keys(apiPreferences);

  apiPreferenceKeys?.forEach(key => {
    // Dynamically assigns the api values to allApiPreferences variable
    allApiPreferences[key] = apiPreferences[key];
  });

  const [searchText, setSearchText] = useState('');

  const defaultOntologies =
    selectedApi === 'ols' ? ['MONDO', 'HP', 'MAXO', 'NCIT'] : ['SNOMEDCT_US'];

  //If there are no preferences set for an API, it sets them to default ontologies
  if (!apiPreferencesCode.hasOwnProperty('umls') && selectedApi === 'umls') {
    apiPreferencesCode.umls = defaultOntologies;
  }
  if (!apiPreferencesCode.hasOwnProperty('ols') && selectedApi === 'ols') {
    apiPreferencesCode.umls = defaultOntologies;
  }

  const options =
    ontologyApis &&
    ontologyApis.map((aap, index) => ({
      value: aap.api_id,
      label: aap.api_id.toUpperCase(),
    }));

  const defaultApi =
    Object.keys(allApiPreferences).length > 0
      ? Object.keys(allApiPreferences)[0]
      : options[0]?.value;
  useEffect(() => {
    setSelectedApi(defaultApi);
  }, []);

  let processedApiPreferencesCode;

  // Ensures the data sent to the API is in the correct format.
  // If apiPreferencesCode is an array, sets processedApiPreferencesCode equal to it.
  // If it is a comma-separated string, it splits it by the commas and adds them to an array
  if (Array.isArray(apiPreferencesCode?.[selectedApi])) {
    processedApiPreferencesCode = apiPreferencesCode[selectedApi];
  } else if (typeof apiPreferencesCode?.[selectedApi] === 'string') {
    processedApiPreferencesCode = apiPreferencesCode[selectedApi].split(',');
  }

  let existingOntologies;

  // Checks if apiPreferencesCode exists and is non-empty, if so, assigns processedApiPreferencesCode to existingOntologies
  if (
    Array.isArray(apiPreferencesCode?.[selectedApi]) &&
    apiPreferencesCode[selectedApi].length > 0
  ) {
    existingOntologies = processedApiPreferencesCode?.map(pap =>
      pap.toUpperCase()
    );
  }

  // Checks if preferenceType[prefTypeKey].api_preference exists and is non-empty, if so, assigns the values to existingOntologies
  else if (
    preferenceType &&
    preferenceType[prefTypeKey] &&
    preferenceType[prefTypeKey].api_preference &&
    Object.keys(preferenceType[prefTypeKey].api_preference).length > 0
  ) {
    existingOntologies = Object.values(
      preferenceType[prefTypeKey].api_preference
    ).flat();
  }
  // If the above are false, defaultOntologies are used for the search
  else {
    existingOntologies = defaultOntologies;
  }

  useEffect(() => {
    setCheckedOntologies(existingOntologies.map(eo => eo.toUpperCase()));
  }, [preferenceType, selectedApi]);

  const onCheckboxChange = e => {
    const { value, checked } = e.target;

    // Update checkedOntologies state (independent of apiPreferencesCode)
    setCheckedOntologies(prevCheckedOntologies => {
      // If checked, add the value to checkedOntologies
      const updatedCheckedOntologies = checked
        ? [...prevCheckedOntologies, value.toUpperCase()]
        : prevCheckedOntologies.filter(
            ontology => ontology !== value.toUpperCase()
          );

      // Return the updated checkedOntologies array (for state change)
      return updatedCheckedOntologies;
    });

    // Now, update apiPreferencesCode based on the checkbox state
    setApiPreferencesCode(prevApiPreferences => {
      const updatedApiPreferences = { ...prevApiPreferences };

      // Initialize the array for selectedApi if it doesn't exist
      if (!updatedApiPreferences[selectedApi]) {
        updatedApiPreferences[selectedApi] = [];
      }

      // If checkbox is checked, add the value to the apiPreferencesCode
      if (checked) {
        updatedApiPreferences[selectedApi] = [
          ...new Set([
            ...updatedApiPreferences[selectedApi],
            value.toUpperCase(),
          ]),
        ];
      } else {
        // If unchecked, remove the value from the apiPreferencesCode array
        updatedApiPreferences[selectedApi] = updatedApiPreferences[
          selectedApi
        ].filter(ontology => ontology !== value.toUpperCase());
      }

      // Return the updated apiPreferencesCode
      return updatedApiPreferences;
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

  // Builds data structure adding the ontology's api to the ontology object, based on the api
  // that is selected in the radio button
  const countsResult = sortedData
    ?.filter(sd => sd?.api_id === selectedApi)
    .map(sd =>
      Object.keys(sd?.ontologies).map(key => {
        return { [key]: countsMap[key] || 0, api: sd?.api_id };
      })
    )
    .flat();

  const checkedOntologiesArray = Array.isArray(checkedOntologies)
    ? checkedOntologies
    : [];

  const getFilteredItems = searchText => {
    const filtered = countsResult?.filter(item => {
      const key = Object.keys(item)[0];
      return key?.toUpperCase().startsWith(searchText?.toUpperCase());
    });
    return filtered;
  };

  return (
    <div
      className={
        active === 'search' || prefTerminologies.length === 0
          ? 'ontology_form'
          : 'ontology_form_pref'
      }
    >
      <Radio.Group
        className="api_radio"
        optionType="button"
        buttonStyle="solid"
        options={options}
        defaultValue={options[0].value}
        onChange={e => setSelectedApi(e.target.value)}
      />
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
            .sort((a, b) => {
              const key1 = Object.keys(a)[0].toUpperCase();
              const key2 = Object.keys(b)[0].toUpperCase();

              const selectedOnts1 = existingOntologies?.includes(key1);
              const selectedOnts2 = existingOntologies?.includes(key2);

              // If both are in existingOntologies, they stay in their relative order
              // If only one is in existingOntologies, it is displayed to the top
              return selectedOnts2 - selectedOnts1;
            })
            .map((item, i) => {
              const key = Object.keys(item)[0];
              const value = item[key];
              return (
                <Checkbox
                  key={i}
                  value={key}
                  checked={checkedOntologiesArray?.includes(key.toUpperCase())}
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
