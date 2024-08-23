import { useContext, useEffect, useState } from 'react';
import './OntologyInfo.scss';
import { getOntologies } from '../Manager/FetchManager';
import { myContext } from '../../App';
import { Spinner } from '../Manager/Spinner';
import { Table } from 'antd';

export const OntologyInfo = () => {
  const { vocabUrl } = useContext(myContext);
  const [ontologies, setOntologies] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getOntologies(vocabUrl)
      .then(data => {
        setOntologies(data);
        if (data.length > 0) {
          setActive(data[0]?.api_id);
        }
      })
      .finally(() => setLoading(false));
  }, [vocabUrl]);

  useEffect(() => {
    if (ontologies.length > 0) {
      setActive(ontologies[0]?.api_id);
    }
  }, [ontologies]);
  console.log(
    ontologies
      .filter(api => api.api_id === active)
      .map(item =>
        Object.values(item?.ontologies || {}).map((ont, i) => ({
          key: i,
          ontology: ont.ontology_title,
          curie: ont.curie,
          version: ont.version,
        }))
      )
  );

  const columns = [
    {
      title: 'Ontology',
      dataIndex: 'ontology',
      width: 400,
    },
    {
      title: 'Curie',
      dataIndex: 'curie',
      width: 100,
    },
    {
      title: 'Version',
      dataIndex: 'version',
      width: 200,
    },
  ];

  const dataSource = ontologies
    .filter(api => api.api_id === active)
    .flatMap(item =>
      Object.values(item?.ontologies || {}).map((ont, i) => ({
        key: i,
        ontology: ont.ontology_title,
        curie: ont.curie,
        version: ont.version,
      }))
    );

  return loading ? (
    <Spinner />
  ) : (
    <div className="about_container">
      <h2>Ontology Information</h2>

      <div className="ontology_container">
        <div className="api_list">
          {ontologies.map((api, index) => (
            <div
              key={index}
              className={active === api.api_id ? 'active_api' : 'inactive_api'}
              onClick={() => setActive(api.api_id)}
            >
              {api.api_id}
            </div>
          ))}
        </div>
        <div className="ontology_list">
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={{
              pageSize: 50,
            }}
            scroll={{
              y: 470,
            }}
          />
        </div>
      </div>
    </div>
  );
};
