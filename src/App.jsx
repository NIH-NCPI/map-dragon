import { useState, createContext, useEffect } from 'react';
import { OntologySearch } from './components/Search/OntologySearch';
import { Outlet, Route, Routes } from 'react-router-dom';
import { NavBar } from './components/Nav/NavBar';
import { Footer } from './components/Nav/Footer';
import { SearchResults } from './components/Search/SearchResults';
import { Terminology } from './components/Projects/Terminologies/Terminology';
import { TableDetails } from './components/Projects/Tables/TableDetails';
import { DDDetails } from './components/Projects/DataDictionaries/DDDetails';
import { StudyDetails } from './components/Projects/Studies/StudyDetails';
import { StudyList } from './components/Projects/Studies/StudyList';

export const myContext = createContext();

function App() {
  const searchUrl = import.meta.env.VITE_SEARCH_ENDPOINT;
  const vocabUrl = import.meta.env.VITE_VOCAB_ENDPOINT;
  const [results, setResults] = useState({}); //search results for mappings
  const [rows, setRows] = useState(20); //number of rows displayed in each page of search results
  const [current, setCurrent] = useState(1); //the page of search results currently displayed
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const initialTerminology = { url: '', description: '', name: '', codes: [] }; //initial state of terminology
  const initialTable = { name: '', description: '', url: '', variables: [] }; //initial state of table
  const initialDD = { name: '', description: '', tables: [] }; //initial state of data dictionary
  const initialStudy = {
    identifier_prefix: '',
    datadictionary: [],
    name: '',
    description: '',
    title: '',
    url: '',
  }; //initial state of study
  const [table, setTable] = useState(initialTable);
  const [dataDictionary, setDataDictionary] = useState(initialDD);
  const [study, setStudy] = useState(initialStudy);

  const [terminology, setTerminology] = useState(initialTerminology);
  const [tablesDD, setTablesDD] = useState([]); //the tables in a data dictionary
  const [studies, setStudies] = useState([]);
  const [studyDDs, setStudyDDs] = useState([]); //the data dictionaries in a study
  const [addStudy, setAddStudy] = useState(false); //triggers modal to open to add a new study
  const [editMappings, setEditMappings] = useState(false); //triggers modal to open to edit mappings
  const [getMappings, setGetMappings] = useState(false); //triggers modal to open to search to get new mappings

  const [loading, setLoading] = useState(true);

  return (
    <myContext.Provider
      value={{
        results,
        setResults,
        rows,
        setRows,
        current,
        setCurrent,
        buttonDisabled,
        setButtonDisabled,
        loading,
        setLoading,
        searchUrl,
        vocabUrl,
        terminology,
        setTerminology,
        table,
        setTable,
        dataDictionary,
        setDataDictionary,
        tablesDD,
        setTablesDD,
        studies,
        setStudies,
        study,
        setStudy,
        studyDDs,
        setStudyDDs,
        addStudy,
        setAddStudy,
        editMappings,
        setEditMappings,
        getMappings,
        setGetMappings,
      }}
    >
      <Routes>
        <Route
          path="/"
          element={
            <>
              <NavBar />
              <Outlet />
              <Footer />
            </>
          }
        >
          <Route index element={<OntologySearch />} />
          <Route path="/search/:query" element={<SearchResults />} />
          <Route path="/studies" element={<StudyList />} />
          <Route path="/Terminology/:terminologyId" element={<Terminology />} />
          <Route path="/Table/:tableId" element={<TableDetails />} />
          <Route path="/DataDictionary/:DDId" element={<DDDetails />} />
          <Route path="/Study/:studyId" element={<StudyDetails />} />
        </Route>
      </Routes>
    </myContext.Provider>
  );
}

export default App;
