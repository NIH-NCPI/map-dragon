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
import { AddStudy } from './components/Projects/Studies/AddStudy';
import { StudyList } from './components/Projects/Studies/StudyList';

export const myContext = createContext();

function App() {
  const searchUrl = import.meta.env.VITE_SEARCH_ENDPOINT;
  const vocabUrl = import.meta.env.VITE_VOCAB_ENDPOINT;
  const [results, setResults] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(20);
  const [current, setCurrent] = useState(1);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const initialTerminology = { url: '', description: '', name: '', codes: [] };
  const initialTable = { name: '', description: '', url: '', variables: [] };
  const initialUpload = { name: '', description: '', url: '', csvContents: [] };
  const initialDD = { name: '', description: '', tables: [] };
  const initialStudy = {
    identifier_prefix: '',
    datadictionary: [],
    name: '',
    description: '',
    title: '',
    url: '',
  };
  const [codeId, setCodeId] = useState(0);
  const [variableId, setVariableId] = useState(0);
  const [table, setTable] = useState(initialTable);
  const [dataDictionary, setDataDictionary] = useState(initialDD);
  const [study, setStudy] = useState(initialStudy);
  const resetTable = () => setTable(initialTable);
  const resetUpload = () => setTable(initialUpload);
  const [terminologies, setTerminologies] = useState([]);

  const [terminology, setTerminology] = useState(initialTerminology);
  const [tables, setTables] = useState([]);
  const [dataDictionaries, setDataDictionaries] = useState([]);
  const [tablesDD, setTablesDD] = useState([]);
  const [studies, setStudies] = useState([]);
  const [studyDDs, setStudyDDs] = useState([]);
  const [addTable, setAddTable] = useState(false);
  const [addTerm, setAddTerm] = useState(false);
  const [addDD, setAddDD] = useState(false);
  const [loadTable, setLoadTable] = useState(false);
  const [addStudy, setAddStudy] = useState(false);
  const [type, setType] = useState();
  const [editMappings, setEditMappings] = useState(false);
  const [getMappings, setGetMappings] = useState(false);

  const [loading, setLoading] = useState(false);

  const addTableVariable = () => {
    const tableVars = table.variables;
    tableVars.push({ id: getVariableId() });
    setTable({
      ...table,
      variables: tableVars,
    });
  };
  const removeTableVariable = variable => {
    const varIndex = table.variables.findIndex(v => v.id === variable.id);
    const tableVars = table.variables;
    tableVars.splice(varIndex, 1);
    setTable({ ...table, variables: tableVars });

    console.log(table);
  };

  const resetTableVariables = () => {
    setTable({ ...table, variables: [] });
  };
  const updateTableVariable = variable => {
    if (variable.id !== undefined) {
      const tableVars = table.variables;
      const varIndex = tableVars.findIndex(v => v.id === variable.id);
      if (varIndex > -1) {
        tableVars[varIndex] = variable;
        setTable({ ...table, variables: tableVars });
      }
    }
  };

  const getCodeId = () => {
    const current = codeId;
    setCodeId(codeId + 1);
    return current;
  };
  const getVariableId = () => {
    const current = variableId;
    setVariableId(variableId + 1);
    return current;
  };

  const handleCodeAdd = () => {
    setTerminology({
      ...terminology,
      codes: [...terminology.codes, { id: getCodeId(), code: '', display: '' }],
    });
  };

  return (
    <myContext.Provider
      value={{
        results,
        setResults,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
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
        initialTerminology,
        terminologies,
        setTerminologies,
        codeId,
        setCodeId,
        getCodeId,
        handleCodeAdd,
        tables,
        setTables,
        table,
        resetTable,
        setTable,
        updateTableVariable,
        resetTableVariables,
        removeTableVariable,
        addTableVariable,
        getVariableId,
        dataDictionaries,
        setDataDictionaries,
        dataDictionary,
        setDataDictionary,
        initialDD,
        tablesDD,
        setTablesDD,
        studies,
        setStudies,
        study,
        setStudy,
        initialStudy,
        studyDDs,
        setStudyDDs,
        addStudy,
        setAddStudy,
        addTable,
        setAddTable,
        resetUpload,
        initialUpload,
        loadTable,
        setLoadTable,
        addTerm,
        setAddTerm,
        addDD,
        setAddDD,
        type,
        setType,
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
          <Route path="/add_study" element={<AddStudy />} />
        </Route>
      </Routes>
    </myContext.Provider>
  );
}

export default App;
