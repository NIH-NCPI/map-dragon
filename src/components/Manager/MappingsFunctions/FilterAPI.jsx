import { useContext, useEffect, useState } from 'react';
import { Checkbox, Form, Input } from 'antd';
import { ModalSpinner, OntologySpinner } from '../Spinner';
import { myContext } from '../../../App';
import { FilterOntology } from './FilterOntology';

export const FilterAPI = ({
  form,
  selectedOntologies,
  setSelectedOntologies,
  selectedBoxes,
  setSelectedBoxes,
  displaySelectedOntologies,
  setDisplaySelectedOntologies,
  ontologyApis,
  active,
  setActive,
  searchText,
  setSearchText,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  paginatedOntologies,
  apiPreferences,
}) => {
  const { Search } = Input;

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
          setOntology(data);
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
        <Form form={form}>
          <div>
            <div className="api_label">APIs</div>

            <Form.Item name={'selected_apis'} valuePropName="value">
              <Checkbox.Group
                className="mappings_checkbox"
                options={ontologyApis.map((api, index) => {
                  return {
                    value: JSON.stringify({ api_preference: api?.api_id }),
                    label: checkboxDisplay(api, index),
                  };
                })}
              />
            </Form.Item>
          </div>
          <div className="ontology_list">
            {tableLoading ? (
              <div className="ontology_spinner_div">
                <OntologySpinner />
              </div>
            ) : (
              <FilterOntology
                ontology={ontology}
                form={form}
                selectedOntologies={selectedOntologies}
                setSelectedOntologies={setSelectedOntologies}
                selectedBoxes={selectedBoxes}
                setSelectedBoxes={setSelectedBoxes}
                displaySelectedOntologies={displaySelectedOntologies}
                setDisplaySelectedOntologies={setDisplaySelectedOntologies}
                searchText={searchText}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                paginatedOntologies={paginatedOntologies}
                apiPreferences={apiPreferences}
              />
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};
