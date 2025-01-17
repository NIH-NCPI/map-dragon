import { useContext, useEffect, useState } from 'react';
import { Checkbox, Form, Tooltip } from 'antd';
import { ModalSpinner, OntologySpinner } from '../Spinner';
import { myContext } from '../../../App';
import { FilterOntology } from './FilterOntology';

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
}) => {
  const { vocabUrl } = useContext(myContext);
  const [ontology, setOntology] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Fetches the active ontologyAPI each time the active API changes
  useEffect(() => {
    active && getOntologyApiById();
  }, [active]);

  const getOntologyApiById = () => {
    return (
      setTableLoading(true),
      fetch(`${vocabUrl}/OntologyAPI/${active}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
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
              ontologies: sortedOntologies,
            };
          });
          setOntology(sortedData);
        })
        .finally(() => setTableLoading(false))
    );
  };

  const checkboxDisplay = (api, index) => {
    return (
      <>
        <div key={index} className="modal_search_result">
          <div
            className={
              active === api.api_id
                ? 'active_selected_api'
                : 'inactive_selected_api'
            }
            onClick={() => setActive(api.api_id)}
          >
            <div className="modal_term_ontology">
              <div>
                <b>{api?.api_id.toUpperCase()}</b>
              </div>
            </div>
            <div>{api?.api_name}</div>
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
          <div style={{ display: 'flex' }}>
            <div style={{ flex: '0 0 25%' }}>
              <div className="api_label">
                <Tooltip title="Default search with OLS using HP, MAXO, MONDO, NCIT">
                  APIs
                </Tooltip>
              </div>
              {ontologyApis.map((api, index) => checkboxDisplay(api, index))}
            </div>
            <div style={{ flex: '0 0 70%' }}>
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
                />
              )}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};
