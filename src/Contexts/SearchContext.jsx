import { createContext, useState } from 'react';
import { Outlet } from 'react-router-dom';

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

  const defaultOntologies = 'mondo,hp,maxo,ncit';

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
  };

  return (
    <SearchContext.Provider value={context}>
      <Outlet />
    </SearchContext.Provider>
  );
}
