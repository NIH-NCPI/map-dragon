import { Checkbox, Form, Pagination } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';

export const FilterOntology = ({
  ontology,
  form,
  selectedOntologies,
  setSelectedOntologies,
  selectedBoxes,
  setSelectedBoxes,
  displaySelectedOntologies,
  setDisplaySelectedOntologies,
  searchText,
  paginatedOntologies,
}) => {
  const [allCheckboxes, setAllCheckboxes] = useState([]);
  const { ontologyForPagination, setOntologyForPagination } =
    useContext(myContext);

  useEffect(() => {
    setOntologyForPagination(ontology);
  }, [ontology]);

  useEffect(() => {
    form.setFieldsValue({
      ontologies: selectedBoxes,
    });
  }, [selectedBoxes, form]);

  const ontologyForCheckboxes = () => {
    return ontology.flatMap(
      item => Object.values(item?.ontologies).map(ont => ont) // Just return `ont` directly
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
      const selectedOntology = ontologyForCheckboxes().find(
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
      const updatedOntologies = ontologyForCheckboxes().filter(
        ont => ont.ontology_code !== selected.ontology
      );
      setOntologiesForSelection(updatedOntologies);
    }
  };

  const selectedOntDisplay = (ont, i) => {
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

  return (
    <>
      {displaySelectedOntologies.length > 0 && (
        <Form.Item name={'selected_ontologies'} valuePropName="value">
          <div className="modal_display_results">
            {displaySelectedOntologies?.map((selected, i) => (
              <Checkbox
                key={i}
                checked={selectedBoxes.some(
                  box => box?.ontology_code === selected?.ontology_code
                )}
                value={selected}
                onChange={e => onCheckboxChange(e, selected)}
              >
                {selectedOntDisplay(selected, i)}
              </Checkbox>
            ))}
          </div>
        </Form.Item>
      )}
      <Form.Item name={'ontologies'} valuePropName="value">
        <Checkbox.Group
          className="mappings_checkbox"
          options={paginatedOntologies
            ?.filter(
              checkbox =>
                !displaySelectedOntologies.some(
                  dsm => checkbox.ontology_code === dsm.ontology_code
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
    </>
  );
};
