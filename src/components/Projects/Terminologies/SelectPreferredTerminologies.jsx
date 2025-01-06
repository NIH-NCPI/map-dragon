import { Checkbox, Form, Input, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { ellipsisString } from '../../Manager/Utilitiy';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { SearchContext } from '../../../Contexts/SearchContext';

export const SelectPreferredTerminologies = ({
  form,
  displaySelectedTerminologies,
  selectedBoxes,
  setSelectedBoxes,
  terminologies,
  setTerminologies,
  setSelectedTerminologies,
  setDisplaySelectedTerminologies,
  searchText,
  setSearchText,
  paginatedTerminologies,
  open,
}) => {
  const { vocabUrl } = useContext(myContext);
  const {
    prefTerminologies,
    setExistingPreferred,
    preferredData,
    setPreferredData,
  } = useContext(SearchContext);
  const { Search } = Input;
  const [loading, setLoading] = useState(false);

  const fetchTerminologies = () => {
    setLoading(true);
    // Maps through prefTerminologies and fetches each terminology by its id
    const fetchPromises = prefTerminologies?.map(pref =>
      fetch(`${vocabUrl}/${pref?.reference}`).then(response => response.json())
    );

    Promise.all(fetchPromises)
      .then(results => {
        // Once all fetch calls are resolved, set the combined data
        setPreferredData(results);
        setExistingPreferred(results);
      })
      .catch(error => {
        notification.error({
          message: 'Error',
          description: 'An error occurred. Please try again.',
        });
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    prefTerminologies && fetchTerminologies();
  }, [open]);

  // If the checkbox is checked, it adds the object to the selectedBoxes array
  // If it is unchecked, it filters it out of the selectedBoxes array.
  const onCheckboxChange = (event, terminology) => {
    if (event.target.checked) {
      setSelectedBoxes(prevState => [...prevState, terminology]);
    } else {
      setSelectedBoxes(prevState =>
        prevState.filter(val => val !== terminology)
      );
    }
  };

  const onSelectedChange = checkedValues => {
    const selected = JSON.parse(checkedValues?.[0]);
    const selectedTerminology = terminologies.find(
      term => term.id === selected.preferred_terminology
    );

    // Updates selectedTerminologies and displayselectedTerminologys to include the new selected items
    setSelectedTerminologies(prevState => [...prevState, selectedTerminology]);

    // Adds the selectedTerminologies to the selectedBoxes to ensure they are checked
    setSelectedBoxes(prevState => {
      const updated = [...prevState, selectedTerminology];
      // Sets the values for the form to the selectedTerminologiess checkboxes that are checked
      form.setFieldsValue({ selected_terminologies: updated });
      return updated;
    });

    setDisplaySelectedTerminologies(prevState => [
      ...prevState,
      selectedTerminology,
    ]);

    // Filters out the selected checkboxes from the results being displayed
    const updatedTerminologies = terminologies.filter(
      term => term.id !== selected.preferred_terminology
    );

    setTerminologies(updatedTerminologies);
  };

  const checkBoxDisplay = (item, index) => {
    return (
      <>
        <div key={index} className="modal_search_result">
          <div>
            <div className="modal_term_ontology">
              <div>
                <Link
                  to={`/Terminology/${item?.id}`}
                  target="_blank"
                  className="terminology_link"
                >
                  <b>{item?.name ? item.name : item?.id}</b>
                </Link>
              </div>
            </div>
            <div>
              {item?.description?.length > 125 ? (
                <Tooltip title={item?.description} mouseEnterDelay={0.5}>
                  {ellipsisString(item?.description, '125')}
                </Tooltip>
              ) : (
                ellipsisString(item?.description, '125')
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  const initialChecked = preferredData?.map(term =>
    JSON.stringify({
      preferred_terminology: term?.id,
    })
  );

  const onExistingChange = checkedValues => {
    setExistingPreferred(checkedValues);
  };

  return (
    <>
      <div className="modal_search_results_header">
        <h3>Terminologies</h3>
        <div className="mappings_search_bar">
          <Search
            placeholder="Search terminologies"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
      </div>
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name={['preferred_terminology']}
          valuePropName="value"
          style={{ marginBottom: '0' }}
        >
          <div className="result_container">
            {preferredData?.length > 0 && (
              <>
                <h4>Preferred</h4>
                <Form.Item
                  initialValue={initialChecked}
                  name={['existing_terminologies']}
                  valuePropName="value"
                  rules={[
                    {
                      required: false,
                    },
                  ]}
                >
                  {preferredData?.length > 0 ? (
                    <Checkbox.Group
                      className="mappings_checkbox"
                      options={preferredData?.map((term, index) => {
                        return {
                          value: JSON.stringify({
                            preferred_terminology: term?.id,
                          }),
                          label: checkBoxDisplay(term, index),
                        };
                      })}
                      onChange={onExistingChange}
                    />
                  ) : (
                    ''
                  )}
                </Form.Item>
              </>
            )}
            {displaySelectedTerminologies?.length > 0 && (
              <>
                <h4>Selected</h4>

                <Form.Item
                  name="selected_terminologies"
                  valuePropName="value"
                  rules={[{ required: false }]}
                >
                  <div className="modal_display_results">
                    {displaySelectedTerminologies?.map((selected, i) => (
                      <Checkbox
                        key={i}
                        checked={selectedBoxes.some(
                          box => box.id === selected.id
                        )}
                        value={selected}
                        onChange={e => onCheckboxChange(e, selected)}
                      >
                        {checkBoxDisplay(selected, i)}
                      </Checkbox>
                    ))}
                  </div>
                </Form.Item>
                <h4>Terminologies</h4>
              </>
            )}
            <Form.Item
              name={['terminologies']}
              valuePropName="value"
              rules={[
                {
                  required: false,
                },
              ]}
            >
              {paginatedTerminologies?.length > 0 ? (
                <>
                  <Checkbox.Group
                    className="mappings_checkbox"
                    options={paginatedTerminologies?.map((term, index) => {
                      return {
                        value: JSON.stringify({
                          preferred_terminology: term.id,
                        }),
                        label: checkBoxDisplay(term, index),
                      };
                    })}
                    onChange={onSelectedChange}
                  />
                </>
              ) : (
                ''
              )}
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </>
  );
};
