import { useContext, useEffect, useState } from 'react';
import { Checkbox, Form, Tooltip } from 'antd';
import { ModalSpinner, OntologySpinner } from '../Spinner';
import { myContext } from '../../../App';
import { FilterOntology } from './FilterOntology';
import './FilterAPI.scss';

export const FilterAPI = ({
  form,
  setSelectedOntologies,
  selectedBoxes,
  setSelectedBoxes,
  displaySelectedOntologies,
  setDisplaySelectedOntologies,
  ontologyApis,
  active,
  setActive,
  paginatedOntologies,
  apiPreferences,
  table,
  terminology,
  existingOntologies,
  setExistingOntologies,
  flattenedFilters,
  prefTerminologies,
  setExistingPreferred,
  preferredData,
  setPreferredData
}) => {
  const { vocabUrl } = useContext(myContext);
  const [ontology, setOntology] = useState([]);
  const [displaySelectedTerminologies, setDisplaySelectedTerminologies] =
    useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Fetches the active ontologyAPI each time the active API changes
  useEffect(() => {
    if (active === 'term') {
      if (!preferredData || preferredData?.length === 0) {
        fetchTerminologies();
      }
    } else {
      getOntologyApiById();
    }
  }, [active]);

  const getOntologyApiById = () => {
    return (
      setTableLoading(true),
      fetch(`${vocabUrl}/OntologyAPI/${active}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          } else {
            return res.json().then(error => {
              throw new Error(error);
            });
          }
        })
        .then(data => {
          //Alphabetizes the data
          const sortedData = data.map(api => {
            const sortedOntologies = Object.fromEntries(
              Object.entries(api.ontologies).sort((a, b) =>
                a[1].ontology_code > b[1].ontology_code ? 1 : -1
              )
            );

            return {
              ...api,
              ontologies: sortedOntologies
            };
          });
          setOntology(sortedData);
        })
        .finally(() => setTableLoading(false))
    );
  };

  const fetchTerminologies = () => {
    setLoading(true);
    // Maps through prefTerminologies and fetches each terminology by its id
    const fetchPromises = prefTerminologies?.map(pref =>
      fetch(`${vocabUrl}/${pref?.reference}`).then(response => response.json())
    );

    Promise.all(fetchPromises)
      .then(results => {
        // Once all fetch calls are resolved, set the combined data
        setPreferredData(results);
        setExistingPreferred(results);
      })
      .catch(error => {
        notification.error({
          message: 'Error',
          description: 'An error occurred. Please try again.'
        });
      })
      .finally(() => setLoading(false));
  };

  const checkboxDisplay = (api, index) => {
    return (
      <>
        <div key={index} className="modal_search_result">
          <div
            className={
              (api ? active === api?.api_id : active === 'term')
                ? 'active_selected_api'
                : 'inactive_selected_api'
            }
            onClick={() => setActive(api ? api?.api_id : 'term')}
          >
            <div className="modal_term_ontology">
              <div>
                <b>
                  {api ? api?.api_id.toUpperCase() : 'MapDragon Terminologies'}
                </b>
              </div>
            </div>
            <div>{api ? api?.api_name : ''}</div>
          </div>
        </div>
      </>
    );
  };

  return loading ? (
    <ModalSpinner />
  ) : (
    <div>
      <div className="api_list">
        <Form form={form} preserve={false}>
          <div className="api_filters_wrapper">
            <div className="api_filters_container">
              <div>
                <div className="api_label">
                  <Tooltip title="Default search with OLS using HP, MAXO, MONDO, NCIT">
                    APIs
                  </Tooltip>
                </div>
                {ontologyApis.map((api, index) => checkboxDisplay(api, index))}
              </div>
              <div>
                <div className="api_label">Terminologies</div>
                {checkboxDisplay(null, null)}
              </div>
            </div>
            <div className="api_filters_ontology_list">
              {tableLoading ? (
                <div className="ontology_spinner_div">
                  <OntologySpinner />
                </div>
              ) : (
                <FilterOntology
                  ontology={ontology}
                  form={form}
                  setSelectedOntologies={setSelectedOntologies}
                  selectedBoxes={selectedBoxes}
                  setSelectedBoxes={setSelectedBoxes}
                  displaySelectedOntologies={displaySelectedOntologies}
                  setDisplaySelectedOntologies={setDisplaySelectedOntologies}
                  paginatedOntologies={paginatedOntologies}
                  apiPreferences={apiPreferences}
                  table={table}
                  terminology={terminology}
                  existingOntologies={existingOntologies}
                  setExistingOntologies={setExistingOntologies}
                  flattenedFilters={flattenedFilters}
                  preferredData={preferredData}
                  active={active}
                  displaySelectedTerminologies={displaySelectedTerminologies}
                  setDisplaySelectedTerminologies={
                    setDisplaySelectedTerminologies
                  }
                />
              )}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};
