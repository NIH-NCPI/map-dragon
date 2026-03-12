import { useContext, useEffect, useState } from 'react';
import { Form, Tooltip } from 'antd';
import { ModalSpinner, OntologySpinner } from '../Spinner';
import { myContext } from '../../../App';
import { FilterOntology } from './FilterOntology';
import './FilterAPI.scss';
import { getAll } from '../FetchManager';
import { useNavigate } from 'react-router-dom';

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
  existingPreferred,
  setExistingPreferred,
  preferredData,
  paginatedTerminologies,
  displaySelectedTerminologies,
  setDisplaySelectedTerminologies,
  terminologies,
  setTerminologies,
  selectedTerminologies,
  setSelectedTerminologies,
  componentString,
  setPrefTerminologies
}) => {
  const { vocabUrl } = useContext(myContext);
  const [ontology, setOntology] = useState([]);

  const [originalTerminologies, setOriginalTerminologies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const navigate = useNavigate();

  // Fetches the active ontologyAPI each time the active API changes
  useEffect(() => {
    if (active === 'term') {
      getAll(vocabUrl, 'Terminology', navigate).then(data => {
        setTerminologies(data);
        setOriginalTerminologies(data);
      });
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
                  terminologies={terminologies}
                  active={active}
                  displaySelectedTerminologies={displaySelectedTerminologies}
                  setDisplaySelectedTerminologies={
                    setDisplaySelectedTerminologies
                  }
                  existingPreferred={existingPreferred}
                  setExistingPreferred={setExistingPreferred}
                  preferredData={preferredData}
                  paginatedTerminologies={paginatedTerminologies}
                  selectedTerminologies={selectedTerminologies}
                  setSelectedTerminologies={setSelectedTerminologies}
                  componentString={componentString}
                  setPrefTerminologies={setPrefTerminologies}
                />
              )}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};
