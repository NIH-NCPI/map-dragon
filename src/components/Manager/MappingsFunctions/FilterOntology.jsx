import { Checkbox, Form, Input } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { FilterReset } from './FilterReset';
import { SearchContext } from '../../../Contexts/SearchContext';

export const FilterOntology = ({
  ontology,
  form,
  setSelectedOntologies,
  selectedBoxes,
  setSelectedBoxes,
  displaySelectedOntologies,
  setDisplaySelectedOntologies,
  paginatedOntologies,
  table,
  terminology,
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
      ontologies: selectedBoxes,
    });
  }, [selectedBoxes, form]);

  const ontologyForCheckboxes = () => {
    return ontology.flatMap(item =>
      Object.values(item?.ontologies).map(ont => ({
        ...ont,
        api: ontology?.[0]?.api_id,
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

  const onSelectedChange = checkedValues => {
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
        selectedOntology,
      ]);

      // Filters out the selected ontologies from the available ones
      const updatedOntologies = allCheckboxes?.filter(
        ont => ont.ontology_code !== selected.ontology
      );
      setOntologiesForSelection(updatedOntologies);
    }
  };

  const checkBoxDisplay = (ont, i) => {
    return (
      <>
        <div key={i} className="modal_search_result">
          <div>
            <div className="modal_term_ontology">
              <div>{ont?.curie}</div>
            </div>
            <div>{ont?.ontology_title}</div>
          </div>
        </div>
      </>
    );
  };

  const existingDisplay = (ont, i) => {
    return (
      <>
        <div key={i} className="modal_search_result">
          <div>
            <div className="modal_term_ontology">
              <div>{ont.ontology.toUpperCase()}</div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // The first key is different depending if it's coming from a table or terminology. This dynamically gets the first key

  const existingFilters = Object.values(
    preferenceType[prefTypeKey] || {}
  )?.flat();

  const flattenedFilters = existingFilters
    .flatMap(item =>
      Object.keys(item).map(key =>
        item[key].map(value => ({
          api: key,
          ontology: value,
        }))
      )
    )
    .flat();

  const initialChecked = flattenedFilters?.map(ef =>
    JSON.stringify({
      ontology: ef,
    })
  );

  return (
    <>
      <div className="modal_checkbox_wrapper">
        <Search
          placeholder="Search ontologies"
          className="api_onto_search_bar"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        {Object.keys(preferenceType[prefTypeKey]?.api_preference || {}).some(
          key => preferenceType[prefTypeKey]?.api_preference[key]?.length > 0
        ) && (
          <>
            <div className="onto_reset">
              <h4>Ontology Filters</h4>{' '}
              <FilterReset table={table} terminology={terminology} />
            </div>
            <Form.Item
              initialValue={initialChecked}
              name={['existing_filters']}
              valuePropName="value"
              rules={[
                {
                  required: false,
                },
              ]}
            >
              {flattenedFilters?.length > 0 && (
                <Checkbox.Group
                  className="mappings_checkbox"
                  options={flattenedFilters?.map((ff, index) => {
                    return {
                      value: JSON.stringify({
                        ontology: ff,
                      }),
                      label: existingDisplay(ff, index),
                    };
                  })}
                />
              )}
            </Form.Item>
          </>
        )}
        {displaySelectedOntologies.length > 0 && (
          <>
            <h4>Selected</h4>
            <Form.Item name={'selected_ontologies'} valuePropName="value">
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
                    {checkBoxDisplay(selected, i)}
                  </Checkbox>
                ))}
              </div>
            </Form.Item>
          </>
        )}
        {(Object.keys(preferenceType?.self?.api_preference || {}).some(
          key => preferenceType?.self?.api_preference[key]?.length > 0
        ) ||
          displaySelectedOntologies.length > 0) && <h4>Ontologies</h4>}
        <Form.Item name={'ontologies'} valuePropName="value">
          <Checkbox.Group
            className="mappings_checkbox"
            options={paginatedOntologies
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
                  ontology: ont.ontology_code,
                }),
                label: checkBoxDisplay(ont, i),
              }))}
            value={selectedBoxes.map(item =>
              JSON.stringify({ ontology: item.ontology_code })
            )}
            onChange={onSelectedChange}
          />
        </Form.Item>
      </div>
    </>
  );
};
