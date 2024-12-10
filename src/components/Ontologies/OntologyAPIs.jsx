import { useContext, useEffect, useState } from 'react';
import './OntologyInfo.scss';
import { getOntologies } from '../Manager/FetchManager';
import { myContext } from '../../App';
import { SmallSpinner, Spinner } from '../Manager/Spinner';
import { Tooltip } from 'antd';

import { OntologyTable } from './OntologyTable';

export const OntologyInfo = () => {
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

  return loading ? (
    <Spinner />
  ) : (
    <div className="studies_container">
      <h2>Ontology Information</h2>

      <div className="ontology_container">
        <div className="api_list">
          <div className="api_label">APIs</div>
          {ontologyApis.map((api, index) => (
            <div
              key={index}
              className={active === api.api_id ? 'active_api' : 'inactive_api'}
              onClick={() => setActive(api.api_id)}
            >
              <Tooltip
                placement="left"
                mouseEnterDelay={0.5}
                title={api.api_name}
              >
                {api.api_id.toUpperCase()}
              </Tooltip>
            </div>
          ))}
        </div>
        <div className="ontology_list">
          {tableLoading ? (
            <SmallSpinner />
          ) : (
            <OntologyTable ontology={ontology} />
          )}
        </div>
      </div>
    </div>
  );
};
