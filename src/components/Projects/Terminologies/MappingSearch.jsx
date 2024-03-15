import { Checkbox, Form, Tooltip } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { myContext } from '../../../App';
import { ellipsisString } from '../../Manager/Utilitiy';
import { ModalSpinner } from '../../Manager/Spinner';

export const MappingSearch = ({
  terminology,
  editMappings,
  setEditMappings,
  setMapping,
  mappingsForSearch,
  form,
}) => {
  const { URL } = useContext(myContext);
  const [page, setPage] = useState(0);
  const entriesPerPage = 15;
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState();
  const [resultsCount, setResultsCount] = useState();
  const [lastCount, setLastCount] = useState(0); //save last count as count of the results before you fetch data again
  const [initial, setInitial] = useState([]);
  let ref = useRef();

  useEffect(() => {
    if (!!editMappings) {
      fetchResults(page);
    }
  }, [page, editMappings]);

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
      setEditMappings(null);
    },
    [],
  );

  const fetchResults = page => {
    if (!!!editMappings) {
      return undefined;
    }
    setLoading(true);
    const pageStart = page * entriesPerPage;
    return fetch(
      `${URL}q=${editMappings?.code}&ontology=mondo,hp,maxo,ncit&rows=${entriesPerPage}&start=${pageStart}`,
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

  const initialChecked = mappingsForSearch.map(m =>
    results.filter(r => r.obo_id === m.code),
  );

  console.log('initial checked', initialChecked);
  console.log('results', results);

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
      <div className="results_modal_container">
        <>
          {loading === false ? (
            <>
              <div className="modal_search_results">
                <div className="modal_search_results_header">
                  <h3>Search results for: {editMappings?.code}</h3>
                </div>
                {results?.length > 0 ? (
                  <div className="result_container">
                    <Form form={form} layout="vertical" preserve={false}>
                      <Form.Item
                        name={['mappings']}
                        valuePropName="value"
                        rules={[
                          {
                            required: true,
                            message: 'Please make a selection.',
                          },
                        ]}
                        // initialValue={initialChecked}
                      >
                        {results?.length > 0 ? (
                          <Checkbox.Group
                            defaultValue={initialChecked}
                            className="mappings_checkbox"
                            options={results?.map((d, index) => {
                              return {
                                value: JSON.stringify({
                                  code: d.obo_id,
                                  display: d.label,
                                  // description: d.description[0],
                                  system: systemsMatch(d?.obo_id.split(':')[0]),
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
    </>
  );
};
