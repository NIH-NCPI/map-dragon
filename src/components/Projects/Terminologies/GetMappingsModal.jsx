import { Checkbox, Modal, Form, Tooltip } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { myContext } from '../../../App';
import { ellipsisString } from '../../Manager/Utilitiy';
import { ModalSpinner } from '../../Manager/Spinner';
import { getById, handleUpdate } from '../../Manager/FetchManager';

export const GetMappingsModal = ({
  terminology,
  setTerminology,
  getMappings,
  setGetMappings,
  setMapping,
  terminologyId,
}) => {
  const [form] = Form.useForm();
  const { URL, vocabUrl } = useContext(myContext);
  const [page, setPage] = useState(0);
  const entriesPerPage = 15;
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState();
  const [resultsCount, setResultsCount] = useState();
  const [lastCount, setLastCount] = useState(0); //save last count as count of the results before you fetch data again

  let ref = useRef();

  useEffect(() => {
    if (!!getMappings) {
      fetchResults(page);
    }
  }, [page, getMappings]);

  useEffect(() => {
    if (results && page > 0) {
      const container = ref.current.closest('.ant-modal-body');
      const scrollTop = ref.current.offsetTop - container.offsetTop;
      container.scrollTop = scrollTop;
      // container.scrollIntoView({
      //   behavior: 'smooth',
      // });
    }
  }, [results]);

  useEffect(
    () => () => {
      setGetMappings(null);
    },
    [],
  );

  const handleSubmit = values => {
    const mappingsDTO = () => {
      let mappings = [];
      values?.mappings?.forEach(v => mappings.push(JSON.parse(v)));
      return { mappings: mappings };
    };
    fetch(
      `${vocabUrl}/Terminology/${terminology.id}/mapping/${getMappings.code}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappingsDTO()),
      },
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => setMapping(data.codes));
  };

  const fetchResults = page => {
    if (!!!getMappings) {
      return undefined;
    }
    setLoading(true);
    const pageStart = page * entriesPerPage;
    return fetch(
      `${URL}q=${getMappings?.code}&ontology=mondo,hp,maxo,ncit&rows=${entriesPerPage}&start=${pageStart}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
      .then(res => res.json())
      .then(data => {
        let res = ontologyFilter(data?.response?.docs);
        if (page > 0 && results.length > 0) {
          res = results.concat(res);
        } else {
          setTotalCount(data.response.numFound);
        }
        setResults(res);
        setResultsCount(res.length);
      })
      .then(() => setLoading(false));
  };

  const ontologySystems = {
    MONDO: 'http://purl.obolibrary.org/obo/mondo.owl',
    HP: 'http://purl.obolibrary.org/obo/hp.owl',
    MAXO: 'http://purl.obolibrary.org/obo/maxo.owl',
    NCIT: 'http://purl.obolibrary.org/obo/ncit.owl',
  };

  const systemsMatch = ont => {
    return ontologySystems[ont];
  };

  const handleViewMore = e => {
    e.preventDefault();
    setPage(page + 1);
  };
  const ontologyFilter = d =>
    d.filter(d => d?.obo_id.split(':')[0] === d?.ontology_prefix);

  const checkBoxDisplay = (d, index) => {
    index === lastCount + 1;
    return (
      <>
        <div
          key={index}
          // prettier-ignore
          ref={index === lastCount + 1 ? ref : undefined}
          className="modal_search_result"
          id="scrollbar"
        >
          <div>
            <div className="modal_term_ontology">
              <div>
                <b>{d.label}</b>
              </div>
              <div>
                <a href={d.iri} target="_blank">
                  {d.obo_id}
                </a>
              </div>
            </div>
            <div>{ellipsisString(d?.description[0], '100')}</div>
            {/* <div>Ontology: {d.ontology_prefix}</div> */}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <Modal
        open={!!getMappings}
        closeIcon={false}
        width={'51%'}
        styles={{ body: { height: '60vh', overflowY: 'auto' } }}
        okText="Save"
        onOk={() => {
          form.validateFields().then(values => {
            handleSubmit(values);
            form.resetFields();
            setGetMappings(null);
            setPage(0);
            setResults([]);
            setLoading(true);
          });
        }}
        onCancel={() => {
          form.resetFields();
          setGetMappings(null);
          setPage(0);
          setResults([]);
          setLoading(true);
        }}
        maskClosable={false}
        destroyOnClose={true}
      >
        <div className="results_modal_container">
          <>
            {loading === false ? (
              <>
                <div className="modal_search_results">
                  <div className="modal_search_results_header">
                    <h3>Search results for: {getMappings?.code}</h3>
                  </div>
                  {results?.length > 0 ? (
                    <div className="result_container">
                      <Form form={form} layout="vertical">
                        <Form.Item
                          name={['mappings']}
                          valuePropName="value"
                          rules={[
                            {
                              required: true,
                              message: 'Please make a selection.',
                            },
                          ]}
                        >
                          {results?.length > 0 ? (
                            <Checkbox.Group
                              className="mappings_checkbox"
                              options={results?.map((d, index) => {
                                return {
                                  value: JSON.stringify({
                                    code: d.obo_id,
                                    display: d.label,
                                    // description: d.description[0],
                                    system: systemsMatch(
                                      d?.obo_id.split(':')[0],
                                    ),
                                  }),
                                  label: checkBoxDisplay(d, index),
                                };
                              })}
                            />
                          ) : (
                            ''
                          )}
                        </Form.Item>
                      </Form>
                      <div>
                        <Tooltip
                          placement="bottom"
                          title="Redundant entries have been removed"
                        >
                          Displaying {resultsCount}
                          &nbsp;of&nbsp;{totalCount}
                        </Tooltip>
                        {resultsCount !== totalCount ? (
                          <span
                            className="view_more_link"
                            onClick={e => {
                              handleViewMore(e);
                              setLastCount(resultsCount);
                            }}
                          >
                            View More
                          </span>
                        ) : (
                          ''
                        )}
                      </div>
                    </div>
                  ) : (
                    <h3>No results found.</h3>
                  )}
                </div>
              </>
            ) : (
              <div className="loading_spinner">
                <ModalSpinner />
              </div>
            )}
          </>
        </div>
      </Modal>
    </>
  );
};
