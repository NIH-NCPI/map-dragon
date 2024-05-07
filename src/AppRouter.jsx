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

import './App.scss';
import { MappingContext, MappingContextRoot } from './MappingContext';

export const AppRouter = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <div className="approuter_div">
              <NavBar />
              <div className="outlet_div">
                <Outlet />
              </div>
              <Footer />
            </div>
          </>
        }
      >
        <Route index element={<OntologySearch />} />
        <Route path="/search/:query" element={<SearchResults />} />
        <Route path="/studies" element={<StudyList />} />
        <Route element={<MappingContextRoot />}>
          <Route path="/Terminology/:terminologyId" element={<Terminology />} />
          {/* <Route path="/Table/:tableId" element={<TableDetails />} /> */}
          <Route path="/DataDictionary/:DDId">
            <Route index element={<DDDetails />} />
            <Route
              path="/DataDictionary/:DDId/Table/:tableId"
              element={<TableDetails />}
            />
          </Route>
        </Route>
        <Route path="/Study/:studyId" element={<StudyDetails />} />
      </Route>
    </Routes>
  );
};
