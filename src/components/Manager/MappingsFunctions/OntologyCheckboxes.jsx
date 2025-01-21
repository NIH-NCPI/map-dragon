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
  } = useContext(SearchContext);
  const { Search } = Input;

  let allApiPreferences = {};

  const codeToSearch = Object.keys(unformattedPref)?.[0];
  const apiPreferences = unformattedPref[codeToSearch]?.api_preference;
  const apiPreferenceKeys = Object.keys(apiPreferences);

  apiPreferenceKeys?.forEach(key => {
    // Dynamically assigns the api values to allApiPreferences variable
    allApiPreferences[key] = apiPreferences[key];
  });

  const [searchText, setSearchText] = useState('');

  const defaultOntologies = ['MONDO', 'HP', 'MAXO', 'NCIT'];

  let processedApiPreferencesCode;

  // Ensures the data sent to the API is in the correct format.
  // If apiPreferencesCode is an array, sets processedApiPreferencesCode equal to it.
  // If it is a comma-separated string, it splits it by the commas and adds them to an array
  if (Array.isArray(apiPreferencesCode)) {
    processedApiPreferencesCode = apiPreferencesCode;
  } else if (typeof apiPreferencesCode === 'string') {
    processedApiPreferencesCode = apiPreferencesCode.split(',');
  }

  let existingOntologies;

  // Checks if apiPreferencesCode exists and is non-empty, if so, assigns processedApiPreferencesCode to existingOntologies
  if (Array.isArray(apiPreferencesCode) && apiPreferencesCode.length > 0) {
    existingOntologies = processedApiPreferencesCode;
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
    setCheckedOntologies(existingOntologies);
  }, [preferenceType]);

  const onCheckboxChange = e => {
    const { value, checked } = e.target;

    setCheckedOntologies(existingOntologies => {
      const newCheckedOntologies = Array.isArray(existingOntologies)
        ? checked
          ? [...existingOntologies, value.toUpperCase()]
          : existingOntologies.filter(key => key !== value.toUpperCase())
        : [];

      setApiPreferencesCode(newCheckedOntologies);

      return newCheckedOntologies;
    });
  };

  const options = allApiPreferences
    ? Object.keys(allApiPreferences).map((aap, index) => ({
        value: aap,
        label: aap.toUpperCase(),
      }))
    : [{ value: 'ols', label: 'OLS' }];

  const [radioApi, setRadioApi] = useState(options ? options[0]?.value : 'ols');

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
    ?.filter(sd => sd?.api_id === radioApi)
    .map(sd =>
      Object.keys(sd?.ontologies).map(key => {
        return { [key]: countsMap[key] || 0, api: sd?.api_id };
      })
    )
    .flat();

  console.log('countsREsult', countsResult);
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

  console.log('getFilteredItems', getFilteredItems());

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
        onChange={e => setRadioApi(e.target.value)}
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
