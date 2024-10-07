import { useContext, useEffect, useState } from 'react';
import { Checkbox, Form, Tooltip } from 'antd';
import { getOntologies } from '../FetchManager';
import { ModalSpinner, SmallSpinner, Spinner } from '../Spinner';
import { myContext } from '../../../App';
import { FilterOntology } from './FilterOntology';

export const FilterAPI = ({ form }) => {
  const { vocabUrl } = useContext(myContext);
  const [ontologyApis, setOntologyApis] = useState([]);
  const [ontology, setOntology] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Gets the ontologyAPIs on first load, automatically sets active to the first of the list to display on the page
  useEffect(() => {
    setLoading(true);
    getOntologies(vocabUrl)
      .then(data => {
        setOntologyApis(data);
        if (data.length > 0) {
          setActive(data[0]?.api_id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

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
        <Form form={form} layout="vertical">
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
              <SmallSpinner />
            ) : (
              <FilterOntology ontology={ontology} form={form} />
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};
