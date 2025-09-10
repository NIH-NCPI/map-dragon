import { createContext, useContext, useEffect, useState } from 'react';
import { myContext } from '../App';
import { Outlet } from 'react-router-dom';
import { getDefaultOntologies } from '../components/Manager/FetchManager';
export const SearchContext = createContext();

export function SearchContextRoot() {
  const [prefTerminologies, setPrefTerminologies] = useState([]);
  const [assignMappings, setAssignMappings] = useState(true);
  const [existingPreferred, setExistingPreferred] = useState([]);
  const [preferredData, setPreferredData] = useState([]);
  const [apiResults, setApiResults] = useState([]);
  const [apiResultsCount, setApiResultsCount] = useState();
  const [apiPage, setApiPage] = useState(0);
  const [apiTotalCount, setApiTotalCount] = useState();
  const [apiPreferences, setApiPreferences] = useState({});
  const [apiPreferencesCode, setApiPreferencesCode] = useState(undefined);
  const [unformattedPref, setUnformattedPref] = useState([]);
  const [facetCounts, setFacetCounts] = useState([]);
  const [ontologyApis, setOntologyApis] = useState([]);
  const [apiPreferencesTerm, setApiPreferencesTerm] = useState(undefined);
  const [searchText, setSearchText] = useState('');
  const [checkedOntologies, setCheckedOntologies] = useState([]);
  const [moreAvailable, setMoreAvailable] = useState(false);
  const [resultsCount, setResultsCount] = useState();
  const [selectedApi, setSelectedApi] = useState('');
  const { vocabUrl } = useContext(myContext);
  const [defaultOntologies, setDefaultOntologies] = useState([]);
  const [page, setPage] = useState(0);
  const [ontologiesToSearch, setOntologiesToSearch] = useState([]);
  const entriesPerPage = 100;
  useEffect(() => {
    const fetchDefaultOntologiesData = async () => {
      try {
        const result = await getDefaultOntologies(vocabUrl);
        setDefaultOntologies(
          result['Application Default'].api_preference.ols.map(str =>
            str.toUpperCase()
          )
        ); // Update state with fetched data
      } catch (error) {
        console.error('Error fetching default ontologies:', error);
      }
    };

    fetchDefaultOntologiesData();
  }, [vocabUrl]);

  useEffect(() => {
    if (apiPreferencesCode) {
      const codeToSearch = Object.keys(unformattedPref)?.[0];
      const savedApiPreferences =
        unformattedPref?.[codeToSearch]?.api_preference;
      const apiPreferenceKeys = Object?.keys(savedApiPreferences ?? {});
      const apiForSearch = selectedApi ?? apiPreferenceKeys[0];
      setOntologiesToSearch(
        apiPreferencesCode[selectedApi]?.length > 0
          ? apiPreferencesCode?.[selectedApi]?.map(sa => sa?.toUpperCase())
          : preferenceType?.[prefTypeKey]?.api_preference &&
            apiForSearch in apiPreferencesCode
          ? apiPreferencesCode[apiPreferenceKeys[0]].join(',').toUpperCase()
          : defaultOntologies
      );
    }
  }, [apiPreferencesCode, defaultOntologies, selectedApi]);

  const preferenceTypeSet = data =>
    apiPreferencesTerm ? setApiPreferencesTerm(data) : setApiPreferences(data);

  // Checks if there are apiPreferences (table) or apiPreferencesTerm (terminology) and returns the appropriate one
  const preferenceType = apiPreferencesTerm ?? apiPreferences;
  const prefTypeKey = preferenceType && Object.keys(preferenceType)[0];

  const context = {
    prefTerminologies,
    setPrefTerminologies,
    assignMappings,
    setAssignMappings,
    existingPreferred,
    setExistingPreferred,
    preferredData,
    setPreferredData,
    apiResults,
    setApiResults,
    apiResultsCount,
    setApiResultsCount,
    apiPage,
    setApiPage,
    apiTotalCount,
    setApiTotalCount,
    apiPreferences,
    setApiPreferences,
    apiPreferencesCode,
    setApiPreferencesCode,
    defaultOntologies,
    facetCounts,
    setFacetCounts,
    unformattedPref,
    setUnformattedPref,
    ontologyApis,
    setOntologyApis,
    setApiPreferencesTerm,
    apiPreferencesTerm,
    preferenceTypeSet,
    preferenceType,
    prefTypeKey,
    searchText,
    setSearchText,
    checkedOntologies,
    setCheckedOntologies,
    entriesPerPage,
    moreAvailable,
    setMoreAvailable,
    resultsCount,
    setResultsCount,
    setOntologiesToSearch,
    ontologiesToSearch,
    selectedApi,
    setSelectedApi,
    page,
    setPage,
  };

  return (
    <SearchContext.Provider value={context}>
      <Outlet />
    </SearchContext.Provider>
  );
}
