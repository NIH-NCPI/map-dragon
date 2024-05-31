import { message } from 'antd';
import { useState, createContext } from 'react';
import { AppRouter } from './AppRouter';

export const myContext = createContext();

function App() {
  const searchUrl = import.meta.env.VITE_SEARCH_ENDPOINT;
  const vocabUrl = import.meta.env.VITE_VOCAB_ENDPOINT;
  const [results, setResults] = useState({}); //search results for mappings
  const [tablesDD, setTablesDD] = useState([]); //the tables in a data dictionary
  const [studyDDs, setStudyDDs] = useState([]); //the data dictionaries in a study
  const [addStudy, setAddStudy] = useState(false); //triggers modal to open to add a new study
  const [edit, setEdit] = useState(false); //edit state for settings dropdown menus. Triggers edit modal to open.
  const [clear, setClear] = useState(false); // clear mappings state for dropdown menus. Triggers confirm pop-up to clear mappings.
  const [deleteState, setDeleteState] = useState(false);
  const initialTable = { name: '', description: '', url: '', variables: [] }; //initial state of table
  const [table, setTable] = useState(initialTable);
  const initialDD = { name: '', description: '', tables: [] }; //initial state of data dictionary
  const [dataDictionary, setDataDictionary] = useState(initialDD);
  const initialStudy = {
    identifier_prefix: '',
    datadictionary: [],
    name: '',
    description: '',
    title: '',
    url: '',
  }; //initial state of study
  const [study, setStudy] = useState(initialStudy);

  message.config({
    top: '25vh',
  });

  return (
    <myContext.Provider
      value={{
        results,
        setResults,
        searchUrl,
        vocabUrl,
        tablesDD,
        setTablesDD,
        studyDDs,
        setStudyDDs,
        addStudy,
        setAddStudy,
        edit,
        setEdit,
        clear,
        setClear,
        deleteState,
        setDeleteState,
        table,
        setTable,
        dataDictionary,
        setDataDictionary,
        study,
        setStudy,
      }}
    >
      <AppRouter />
    </myContext.Provider>
  );
}

export default App;
