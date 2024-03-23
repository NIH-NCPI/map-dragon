import { useState, createContext } from 'react';
import { AppRouter } from './AppRouter';

export const myContext = createContext();

function App() {
  const searchUrl = import.meta.env.VITE_SEARCH_ENDPOINT;
  const vocabUrl = import.meta.env.VITE_VOCAB_ENDPOINT;
  const [results, setResults] = useState({}); //search results for mappings
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [tablesDD, setTablesDD] = useState([]); //the tables in a data dictionary
  const [studyDDs, setStudyDDs] = useState([]); //the data dictionaries in a study
  const [addStudy, setAddStudy] = useState(false); //triggers modal to open to add a new study
  const [editMappings, setEditMappings] = useState(false); //triggers modal to open to edit mappings
  const [getMappings, setGetMappings] = useState(false); //triggers modal to open to search to get new mappings
  const [edit, setEdit] = useState(false);

  const [loading, setLoading] = useState(true);

  return (
    <myContext.Provider
      value={{
        results,
        setResults,
        buttonDisabled,
        setButtonDisabled,
        searchUrl,
        vocabUrl,
        tablesDD,
        setTablesDD,
        studyDDs,
        setStudyDDs,
        addStudy,
        setAddStudy,
        editMappings,
        setEditMappings,
        getMappings,
        setGetMappings,
        edit,
        setEdit,
      }}
    >
      <AppRouter />
    </myContext.Provider>
  );
}

export default App;
