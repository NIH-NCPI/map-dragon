import { useContext, useEffect, useRef, useState } from 'react';
import { ModalSpinner } from '../../Manager/Spinner';
import { Checkbox, Form, Tooltip } from 'antd';
import { myContext } from '../../../App';
import { ellipsisString, systemsMatch } from '../../Manager/Utilitiy';

export const APIResults = ({
  loading,
  displaySelectedMappings,
  onSelectedChange,
}) => {
  const { apiResults, apiResultsCount, apiPage, setApiPage, apiTotalCount } =
    useContext(myContext);
  const [filteredResultsCount, setFilteredResultsCount] = useState(0);
  const [lastCount, setLastCount] = useState(0); //save last count as count of the results before you fetch data again

  let ref = useRef();

  /* Pagination is handled via a "View More" link at the bottom of the page. 
  Each click on the "View More" link makes an API call to fetch the next 15 results.
  This useEffect moves the scroll bar on the modal to the first index of the new batch of results.
  Because the content is in a modal and not the window, the closest class name to the modal is used for the location of the ref. */
  useEffect(() => {
    if (apiResults && apiPage > 0) {
      const container = ref.current.closest('.ant-modal-body');
      const scrollTop = ref.current.offsetTop - container.offsetTop;
      container.scrollTop = scrollTop;
    }
  }, [apiResults]);

  const handleViewMore = e => {
    e.preventDefault();
    setApiPage(prevPage => prevPage + 1);
  };

  // Creates a Set that excludes the mappings that have already been selected.
  // Then filteres the existing mappings out of the results to only display results that have not yet been selected.
  const getFilteredResults = () => {
    const codesToExclude = new Set([
      ...displaySelectedMappings?.map(m => m?.code),
    ]);
    return apiResults.filter(r => !codesToExclude?.has(r.obo_id));
  };

  const filteredResultsArray = getFilteredResults();

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
            <div>
              {d?.description[0]?.length > 85 ? (
                <Tooltip
                  placement="topRight"
                  mouseEnterDelay={0.5}
                  title={d?.description}
                >
                  {ellipsisString(d?.description[0], '85')}
                </Tooltip>
              ) : (
                ellipsisString(d?.description[0], '85')
              )}
            </div>
          </div>
        </div>
      </>
    );
  };
  return (
    <>
      {loading ? (
        <ModalSpinner />
      ) : (
        <>
          <Form.Item
            name={['filtered_mappings']}
            valuePropName="value"
            rules={[
              {
                required: false,
              },
            ]}
          >
            {filteredResultsArray?.length > 0 ? (
              <Checkbox.Group
                className="mappings_checkbox"
                options={filteredResultsArray?.map((d, index) => {
                  return {
                    value: JSON.stringify({
                      code: d.obo_id,
                      display: d.label,
                      description: d.description[0],
                      system: systemsMatch(d?.obo_id?.split(':')[0]),
                    }),
                    label: checkBoxDisplay(d, index),
                  };
                })}
                onChange={onSelectedChange}
              />
            ) : (
              ''
            )}
          </Form.Item>
          <div>
            {/* 'View More' pagination displaying the number of results being displayed
       out of the total number of results. Because of the filter to filter out the duplicates,
       there is a tooltip informing the user that redundant entries have been removed to explain any
       inconsistencies in results numbers per page. */}
            <Tooltip
              placement="bottom"
              title="Redundant entries have been removed"
            >
              Displaying {apiResultsCount}
              &nbsp;of&nbsp;{apiTotalCount}
            </Tooltip>
            {apiTotalCount - filteredResultsCount !== apiResultsCount && (
              <span
                className="view_more_link"
                onClick={e => {
                  handleViewMore(e);
                  setLastCount(apiResultsCount);
                }}
              >
                View More
              </span>
            )}
          </div>
        </>
      )}
    </>
  );
};
