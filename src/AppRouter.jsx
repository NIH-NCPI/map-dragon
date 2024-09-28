import { OntologySearch } from './components/Search/OntologySearch';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { NavBar } from './components/Nav/NavBar';
import { Footer } from './components/Nav/Footer';
import { SearchResults } from './components/Search/SearchResults';
import { Terminology } from './components/Projects/Terminologies/Terminology';
import { TableDetails } from './components/Projects/Tables/TableDetails';
import { DDDetails } from './components/Projects/DataDictionaries/DDDetails';
import { StudyDetails } from './components/Projects/Studies/StudyDetails';
import { StudyList } from './components/Projects/Studies/StudyList';

import './App.scss';
import { PageLayout } from './components/Styling/PageLayout.jsx';
import { MappingContextRoot } from './Contexts/MappingContext.jsx';
import { Error404 } from './components/Error/Error404';
import { OntologyInfo } from './components/About/OntologyAPIs';
import { TerminologyList } from './components/Projects/Terminologies/TerminologyList';

export const AppRouter = () => {
  return (
    <BrowserRouter>
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
          <Route element={<PageLayout />}>
            <Route path="/search/:query" element={<SearchResults />} />
            <Route path="/404" element={<Error404 />} />
            <Route path="/about" element={<OntologyInfo />} />
            <Route path="/terminologies" element={<TerminologyList />} />
            <Route element={<MappingContextRoot />}>
              <Route path="/studies" element={<StudyList />} />
              <Route path="/Study/:studyId">
                <Route index element={<StudyDetails />} />
                {/* <Route path="/Table/:tableId" element={<TableDetails />} /> */}
                <Route path="/Study/:studyId/DataDictionary/:DDId">
                  <Route index element={<DDDetails />} />
                  <Route
                    path="/Study/:studyId/DataDictionary/:DDId/Table/:tableId"
                    element={<TableDetails />}
                  />
                </Route>
              </Route>
              <Route
                path="/Terminology/:terminologyId"
                element={<Terminology />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>{' '}
    </BrowserRouter>
  );
};
