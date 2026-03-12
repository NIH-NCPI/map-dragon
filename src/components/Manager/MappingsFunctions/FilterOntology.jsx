import { Checkbox, Form, Input, Tooltip } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { FilterReset } from './FilterReset';
import { SearchContext } from '../../../Contexts/SearchContext';
import { Link } from 'react-router-dom';
import { ellipsisString } from '../Utility';

export const FilterOntology = ({
  ontology,
  form,
  setSelectedOntologies,
  selectedBoxes,
  setSelectedBoxes,
  displaySelectedOntologies,
  setDisplaySelectedOntologies,
  displaySelectedTerminologies,
  setDisplaySelectedTerminologies,
  paginatedOntologies,
  table,
  terminology,
  existingOntologies,
  setExistingOntologies,
  flattenedFilters,
  terminologies,
  existingPreferred,
  setExistingPreferred,
  preferredData,
  paginatedTerminologies,
  setSelectedTerminologies,
  componentString,
  setPrefTerminologies,
  active
}) => {
  const { Search } = Input;
  const [allCheckboxes, setAllCheckboxes] = useState([]);
  const { setOntologyForPagination } = useContext(myContext);
  const { preferenceType, prefTypeKey, searchText, setSearchText } =
    useContext(SearchContext);

  useEffect(() => {
    setOntologyForPagination(ontology);
  }, [ontology]);

  useEffect(() => {
    form.setFieldsValue({
      ontologies: selectedBoxes
    });
  }, [selectedBoxes, form]);

  const ontologyForCheckboxes = () => {
    return ontology.flatMap(item =>
      Object.values(item?.ontologies).map(ont => ({
        ...ont,
        api: ontology?.[0]?.api_id
      }))
    );
  };

  const [ontologiesForSelection, setOntologiesForSelection] = useState(
    ontologyForCheckboxes
  );

  useEffect(() => {
    setAllCheckboxes(ontologyForCheckboxes());
  }, [ontology]);

  const onCheckboxChange = (event, selected) => {
    if (event.target.checked) {
      setSelectedBoxes(prevState => [...prevState, selected]);
    } else {
      setSelectedBoxes(prevState => prevState.filter(val => val !== selected));
    }
  };

  const onExistingChange = (checkedValues, api) => {
    setExistingOntologies(prevState => ({
      ...prevState,
      [api]: checkedValues
    }));
  };
  const onExistingTermChange = checkedValues => {
    setExistingPreferred(checkedValues);
  };

  const onSelectedChange = checkedValues => {
    if (active === 'term') {
      const selected = JSON.parse(checkedValues?.[0]);
      const selectedTerminology = terminologies.find(
        term => term.id === selected.preferred_terminology
      );

      // Updates selectedTerminologies and displayselectedTerminologys to include the new selected items
      setSelectedTerminologies(prevState => [
        ...prevState,
        selectedTerminology
      ]);

      // Adds the selectedTerminologies to the selectedBoxes to ensure they are checked
      setSelectedBoxes(prevState => {
        const updated = [...prevState, selectedTerminology];
        // Sets the values for the form to the selectedTerminologiess checkboxes that are checked
        form.setFieldsValue({ selected_terminologies: updated });
        return updated;
      });

      setDisplaySelectedTerminologies(prevState => [
        ...prevState,
        selectedTerminology
      ]);
    } else {
      if (checkedValues.length > 0) {
        const selected = JSON.parse(checkedValues[0]);
        const selectedOntology = allCheckboxes?.find(
          item => item.ontology_code === selected.ontology
        );

        // Updates selectedOntologies and displaySelectedOntologies to include the new selected items
        setSelectedOntologies(prevState => [...prevState, selectedOntology]);

        // Add the selectedOntology to the selectedBoxes
        setSelectedBoxes(prevState => {
          const updated = [...prevState, selectedOntology];
          form.setFieldsValue({ ontologies: updated }); // Update form values
          return updated;
        });

        setDisplaySelectedOntologies(prevState => [
          ...prevState,
          selectedOntology
        ]);

        // Filters out the selected ontologies from the available ones
        const updatedOntologies = allCheckboxes?.filter(
          ont => ont.ontology_code !== selected.ontology
        );
        setOntologiesForSelection(updatedOntologies);
      }
    }
  };

  const checkBoxDisplay = (item, i) => {
    return (
      <>
        <div key={i} className="modal_search_result">
          <div>
            <div className="modal_term_ontology">
              <div>
                {active !== 'term' ? (
                  item?.curie
                ) : (
                  <Link
                    to={`/Terminology/${item?.id}`}
                    target="_blank"
                    className="terminology_link"
                  >
                    <b>{item?.name ? item.name : item?.id}</b>
                  </Link>
                )}
              </div>
            </div>
            <div>
              {active !== 'term' ? (
                item?.ontology_title
              ) : item?.description?.length > 125 ? (
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

  const selectedCheckBoxDisplay = (item, i) => {
    return (
      <>
        <div key={i} className="modal_search_result">
          <div>
            <div className="modal_term_ontology">
              <div>
                {item?.curie ? item?.curie : item?.name ? item.name : item?.id}
                <span className="display_selected_api">
                  {item?.api ? `(${item?.api?.toUpperCase()})` : `(MD)`}
                </span>
              </div>
            </div>
            <div>
              {item?.ontology_title ? (
                item?.ontology_title
              ) : item?.description?.length > 125 ? (
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

  const existingDisplay = (item, i) => {
    return (
      <>
        <div key={i} className="modal_search_result">
          <div>
            <div className="modal_term_ontology">
              <div>
                {item.ontology
                  ? item.ontology.toUpperCase()
                  : (item?.name ?? item?.id)}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };
  return (
    <>
      <div className="modal_checkbox_wrapper">
        <Search
          placeholder="Search filters"
          className="api_onto_search_bar"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        {(Object.keys(preferenceType[prefTypeKey]?.api_preference || {}).some(
          key => preferenceType[prefTypeKey]?.api_preference[key]?.length > 0
        ) ||
          preferredData.length > 0) && (
          <>
            <div className="onto_reset">
              <h4>Ontology Filters</h4>
              <FilterReset
                table={table}
                terminology={terminology}
                setExistingOntologies={setExistingOntologies}
                componentString={componentString}
                setPrefTerminologies={setPrefTerminologies}
                setExistingPreferred={setExistingPreferred}
              />
            </div>
            <div className="mappings_checkbox ">
              {flattenedFilters?.length > 0 && (
                <Form.Item
                  className={`${preferredData?.length < 1 ? 'selected_group' : ''}`}
                  name={['existing_filters']}
                  valuePropName="value"
                  rules={[
                    {
                      required: false
                    }
                  ]}
                  style={{
                    marginBottom: preferredData?.length > 0 ? 0 : ''
                  }}
                >
                  {Array.from(new Set(flattenedFilters.map(ff => ff.api))).map(
                    api => {
                      const apiOntologies = flattenedFilters.filter(
                        ff => ff.api === api
                      );
                      if (apiOntologies.length > 0) {
                        const options = apiOntologies.map((ff, index) => ({
                          value: ff.ontology,
                          label: existingDisplay(ff, index)
                        }));

                        return (
                          <div key={api} className="api_wrapper">
                            <div className="api_header">
                              {api.toUpperCase()}
                            </div>
                            <Checkbox.Group
                              value={existingOntologies[api]}
                              options={options}
                              onChange={checkedValues =>
                                onExistingChange(checkedValues, api)
                              }
                            />
                          </div>
                        );
                      }
                      return null;
                    }
                  )}
                </Form.Item>
              )}
              {preferredData?.length > 0 && (
                <>
                  <Form.Item
                    className="selected_group"
                    name={['existing_terminologies']}
                    valuePropName="value_term"
                    rules={[
                      {
                        required: false
                      }
                    ]}
                  >
                    {preferredData?.length > 0 ? (
                      <div
                        className={`api_wrapper${flattenedFilters?.length > 0 ? ' existing_terminologies' : ''}`}
                      >
                        <div className="api_header">MD</div>
                        <Checkbox.Group
                          value={existingPreferred}
                          options={preferredData?.map((term, index) => {
                            return {
                              value: JSON.stringify({
                                preferred_terminology: term?.id
                              }),
                              label: existingDisplay(term, index)
                            };
                          })}
                          onChange={onExistingTermChange}
                        />
                      </div>
                    ) : (
                      ''
                    )}
                  </Form.Item>
                </>
              )}
            </div>
          </>
        )}
        {displaySelectedOntologies.length > 0 && (
          <>
            <Form.Item
              className={`${displaySelectedTerminologies?.length < 1 ? 'selected_group' : ''}`}
              name={'selected_ontologies'}
              valuePropName="value"
              style={{
                marginBottom: displaySelectedTerminologies?.length > 0 ? 0 : ''
              }}
            >
              <div className="modal_selected">
                {displaySelectedOntologies?.map((selected, i) => (
                  <Checkbox
                    key={i}
                    checked={selectedBoxes.some(
                      box => box?.ontology_code === selected?.ontology_code
                    )}
                    value={selected}
                    onChange={e => onCheckboxChange(e, selected)}
                  >
                    {selectedCheckBoxDisplay(selected, i)}
                  </Checkbox>
                ))}
              </div>
            </Form.Item>
          </>
        )}

        {displaySelectedTerminologies?.length > 0 && (
          <>
            <Form.Item
              className="selected_group"
              name="selected_terminologies"
              valuePropName="value"
              rules={[{ required: false }]}
            >
              <div className="modal_selected">
                {displaySelectedTerminologies?.map((selected, i) => (
                  <Checkbox
                    key={i}
                    checked={selectedBoxes.some(box => box.id === selected.id)}
                    value={selected}
                    onChange={e => onCheckboxChange(e, selected)}
                  >
                    {selectedCheckBoxDisplay(selected, i)}
                  </Checkbox>
                ))}
              </div>
            </Form.Item>
          </>
        )}

        <Form.Item name={'ontologies'} valuePropName="value">
          <Checkbox.Group
            className="mappings_checkbox"
            options={
              active !== 'term'
                ? paginatedOntologies
                    ?.filter(
                      checkbox =>
                        !displaySelectedOntologies.some(
                          dsm => checkbox.ontology_code === dsm.ontology_code
                        ) &&
                        !flattenedFilters.some(
                          ef => checkbox.ontology_code === ef.ontology
                        )
                    )
                    .map((ont, i) => ({
                      value: JSON.stringify({
                        ontology: ont.ontology_code
                      }),
                      label: checkBoxDisplay(ont, i)
                    }))
                : paginatedTerminologies
                    ?.filter(
                      term =>
                        !displaySelectedTerminologies.some(
                          t => t.id === term.id
                        )
                    )
                    .map((term, i) => ({
                      value: JSON.stringify({
                        preferred_terminology: term?.id
                      }),
                      label: checkBoxDisplay(term, i)
                    }))
            }
            value={selectedBoxes.map(item =>
              item?.id
                ? JSON.stringify({ preferred_terminology: item?.id })
                : JSON.stringify({ ontology: item?.ontology_code })
            )}
            onChange={onSelectedChange}
          />
        </Form.Item>
      </div>
    </>
  );
};
