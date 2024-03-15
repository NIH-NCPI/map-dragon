import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { myContext } from '../../../App';
import './Terminology.scss';
import { Spinner } from '../../Manager/Spinner';
import Background from '../../../assets/Background.png';
import { getById } from '../../Manager/FetchManager';
import { Table, Tooltip, Modal } from 'antd';
import { EditMappingsModal } from './EditMappingModal';
import { GetMappingsModal } from './GetMappingsModal';

export const Terminology = () => {
  const { terminologyId } = useParams();
  const {
    terminology,
    setTerminology,
    vocabUrl,
    loading,
    setLoading,
    codeId,
    setCodeId,
    editMappings,
    setEditMappings,
    getMappings,
    setGetMappings,
  } = useContext(myContext);

  const [mapping, setMapping] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getById(vocabUrl, 'Terminology', terminologyId).then(data =>
      setTerminology(data)
    );
    getById(vocabUrl, 'Terminology', `${terminologyId}/mapping`)
      .then(data => setMapping(data.codes))
      .then(() => setLoading(false));
  }, []);

  const matchCode = code =>
    mapping?.length > 0
      ? mapping?.map((item, index) =>
          item.code === code.code && item?.mappings?.length > 0 ? (
            <Tooltip
              title={item.mappings.map(code => {
                return <div>{code.code}</div>;
              })}
              key={index}
            >
              {item.mappings.length}
            </Tooltip>
          ) : (
            ''
          )
        )
      : '';

  const columns = [
    { title: 'Code', dataIndex: 'code', width: 170 },
    { title: 'Display', dataIndex: 'display', width: 430 },
    { title: 'Mapped Terms', dataIndex: 'mapped_terms', width: 140 },
    { title: '', dataIndex: 'get_mappings' },
  ];

  const dataSource = terminology?.codes?.map((code, index) => {
    return {
      key: index,
      code: code.code,
      display: code.display,
      mapped_terms: matchCode(code),
      get_mappings:
        mapping?.length > 0 ? (
          mapping.some(m => m.code === code.code && m?.mappings?.length > 0) ? (
            <button
              key={code.code}
              className="manage_term_button"
              onClick={() => setEditMappings(code)}
            >
              Edit Mappings
            </button>
          ) : (
            <button
              className="manage_term_button"
              onClick={() => setGetMappings(code)}
            >
              Get Mappings
            </button>
          )
        ) : (
          <button
            className="manage_term_button"
            onClick={() => setGetMappings(code)}
          >
            Get Mappings
          </button>
        ),
    };
  });

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="terminology_container">
          <div className="image_container">
            <img className="background_image_results" src={Background} />
          </div>
          <div className="terminology_details terminology_name">
            <h3> {terminology?.name ? terminology?.name : terminology?.id}</h3>
          </div>
          <div className="terminology_details">{terminology?.url}</div>
          <div className="terminology_details terminology_desc">
            {terminology?.description ? (
              terminology?.description
            ) : (
              <span className="no_description">No description provided.</span>
            )}
          </div>
          <div className="table_container">
            <Table columns={columns} dataSource={dataSource} />
          </div>
          <EditMappingsModal
            editMappings={editMappings}
            setEditMappings={setEditMappings}
            mapping={mapping}
            terminologyId={terminologyId}
            setMapping={setMapping}
            mnapping={mapping}
          />

          <GetMappingsModal
            terminology={terminology}
            setTerminology={setTerminology}
            getMappings={getMappings}
            setGetMappings={setGetMappings}
            setMapping={setMapping}
            terminologyId={terminologyId}
          />
        </div>
      )}
    </>
  );
};
