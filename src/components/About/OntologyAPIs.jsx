import { useContext, useEffect, useState } from 'react';
import './OntologyInfo.scss';
import { getOntologies } from '../Manager/FetchManager';
import { myContext } from '../../App';
import { Spinner } from '../Manager/Spinner';
import { Button, Input, Space, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

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

  const columns = [
    {
      title: 'Ontology',
      dataIndex: 'ontology',
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search Ontology`}
            value={selectedKeys[0]}
            onChange={e => {
              setSelectedKeys(e.target.value ? [e.target.value] : []);
              confirm({ closeDropdown: false });
            }}
            style={{ display: 'block', marginBottom: 8 }}
          />
          <Space>
            <Button
              onClick={() => {
                clearFilters();
                setSelectedKeys([]);
                confirm({ closeDropdown: false });
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.ontology.toString().toLowerCase().includes(value.toLowerCase()),
      filterIcon: filtered => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
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
      Object.values(item?.ontologies).map((ont, i) => ({
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
          <div className="api_label">APIs</div>
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
