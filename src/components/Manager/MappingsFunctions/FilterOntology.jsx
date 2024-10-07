import { Checkbox, Form } from 'antd';
import { useEffect, useState } from 'react';

export const FilterOntology = ({ ontology, form }) => {
  const [selectedOntologies, setSelectedOntologies] = useState([]);
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [displaySelectedOntologies, setDisplaySelectedOntologies] = useState(
    []
  );
  const [allCheckboxes, setAllCheckboxes] = useState([]);

  const ontologyForCheckboxes = () => {
    return ontology.flatMap(
      item => Object.values(item?.ontologies).map(ont => ont) // Just return `ont` directly
    );
  };
  const [ontologiesForSelection, setOntologiesForSelection] = useState(
    ontologyForCheckboxes
  );

  useEffect(() => {
    setAllCheckboxes(ontologyForCheckboxes() ?? []);
  }, [ontology]);
  console.log(allCheckboxes);

  //   useEffect(() => {
  //     setOntologiesForSelection(ontologyForCheckboxes());
  //   }, []);

  const onSelectedChange = checkedValues => {
    const selected = JSON.parse(checkedValues?.[0]);
    const selectedOntology = ontologyForCheckboxes().find(
      item => item.ontology_code === selected.ontology
    );
    // Updates selectedTerminologies and displayselectedOntologys to include the new selected items
    setSelectedOntologies(prevState => [...prevState, selectedOntology]);

    // Adds the selectedTerminologies to the selectedBoxes to ensure they are checked
    setSelectedBoxes(prevState => {
      const updated = [...prevState, selectedOntology];
      // Sets the values for the form to the selectedTerminologiess checkboxes that are checked
      form.setFieldsValue({ ontologies: updated });
      return updated;
    });

    setDisplaySelectedOntologies(prevState => [...prevState, selectedOntology]);
    console.log(displaySelectedOntologies);

    // Filters out the selected checkboxes from the results being displayed
    const updatedOntologies = ontologyForCheckboxes().filter(
      ont => ont.ontology_code !== selected.ontology
    );
    console.log(updatedOntologies);
    setOntologiesForSelection(updatedOntologies);
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
      <Form.Item name={'selected_ontologies'} valuePropName="value">
        <div className="modal_display_results">
          {displaySelectedOntologies?.map((selected, i) => (
            <Checkbox
              key={i}
              checked={selectedBoxes.some(
                box => box.ontology_code === selected?.ontology?.ontology_code
              )}
              value={selected}
              onChange={e => onCheckboxChange(e, selected)}
            >
              {selectedOntDisplay(selected, i)}
            </Checkbox>
          ))}
        </div>
      </Form.Item>
      <Form.Item name={'ontologies'} valuePropName="value">
        <Checkbox.Group
          className="mappings_checkbox"
          options={allCheckboxes
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
          onChange={onSelectedChange}
        />
      </Form.Item>
    </>
  );
};
