import { OntologySearch } from './components/Search/OntologySearch';
import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { useContext } from 'react';
import { myContext } from './App.jsx';
import { NavBar } from './components/Nav/NavBar';
import { Login } from './components/Auth/Login.jsx';
import { LoginPage } from './components/Auth/LoginPage.jsx';
import { Breadcrumbs } from './components/Nav/Breadcrumbs.jsx';
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
import { OntologyInfo } from './components/Ontologies/OntologyAPIs.jsx';
import { TerminologyList } from './components/Projects/Terminologies/TerminologyList';
import { SearchContextRoot } from './Contexts/SearchContext.jsx';
import { About } from './components/About/About.jsx';

export const AppRouter = () => {
  const { user } = useContext(myContext);

  const isLoggedIn = () => {
    if (user) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div className="approuter_div">
                <div className="header">
                  <NavBar />
                  <Breadcrumbs />
                </div>
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

            <Route path="/ontologies" element={<OntologyInfo />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/terminologies"
              element={
                isLoggedIn() ? <TerminologyList /> : <Navigate to="/login" />
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/terminology"
              element={<Navigate to="/terminologies" />}
            />
            <Route element={<MappingContextRoot />}>
              <Route element={<SearchContextRoot />}>
                <Route
                  path="/studies"
                  element={
                    isLoggedIn() ? <StudyList /> : <Navigate to="/login" />
                  }
                />
                <Route path="/study" element={<Navigate to="/studies" />} />
                <Route path="/Study/:studyId">
                  <Route
                    index
                    element={
                      isLoggedIn() ? <StudyDetails /> : <Navigate to="/login" />
                    }
                  />
                  <Route path="DataDictionary">
                    <Route
                      index
                      element={
                        isLoggedIn() ? (
                          <StudyDetails />
                        ) : (
                          <Navigate to="/login" />
                        )
                      }
                    />
                    <Route
                      path="/Study/:studyId/DataDictionary/:DDId/Table/"
                      element={
                        isLoggedIn() ? <DDDetails /> : <Navigate to="/login" />
                      }
                    />
                    <Route path="/Study/:studyId/DataDictionary/:DDId">
                      <Route
                        index
                        element={
                          isLoggedIn() ? (
                            <DDDetails />
                          ) : (
                            <Navigate to="/login" />
                          )
                        }
                      />
                      <Route
                        path="/Study/:studyId/DataDictionary/:DDId/Table/:tableId"
                        element={
                          isLoggedIn() ? (
                            <TableDetails />
                          ) : (
                            <Navigate to="/login" />
                          )
                        }
                      />
                      <Route
                        path="/Study/:studyId/DataDictionary/:DDId/Table/:tableId/Terminology/:terminologyId"
                        element={
                          isLoggedIn() ? (
                            <Terminology />
                          ) : (
                            <Navigate to="/login" />
                          )
                        }
                      />
                      <Route
                        path="/Study/:studyId/DataDictionary/:DDId/Table/:tableId/Terminology/"
                        element={
                          isLoggedIn() ? (
                            <Terminology />
                          ) : (
                            <Navigate to="/login" />
                          )
                        }
                      />
                    </Route>
                  </Route>
                </Route>
                <Route
                  path="/Terminology/:terminologyId"
                  element={
                    isLoggedIn() ? <Terminology /> : <Navigate to="/login" />
                  }
                />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>{' '}
    </BrowserRouter>
  );
};
