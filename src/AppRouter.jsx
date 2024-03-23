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

export const AppRouter = () => {
  return (
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
  );
};
