import { useEffect, useState } from 'react';
import { Checkbox, Form } from 'antd';
import { ellipsisString } from '../Utilitiy';

export const AssignMappingsCheckboxes = ({ terminologiesToMap }) => {
  const [form] = Form.useForm();
  const [active, setActive] = useState(null);
  const [originalTerminologies, setOriginalTerminologies] = useState([]);
  const [displaySelectedMappings, setDisplaySelectedMappings] = useState([]);
  const [selectedMappings, setSelectedMappings] = useState([]);
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [activeTerminology, setActiveTerminology] = useState(null);

  useEffect(() => {
    setActive(terminologiesToMap?.[0]?.id);
  }, [terminologiesToMap]);

  useEffect(() => {
    active && mappedTerminology();
    setActiveTerminology(terminologiesToMap.find(term => term.id === active));
  }, [active]);

  const onCheckboxChange = (event, code) => {
    // console.log(code);
    if (event.target.checked) {
      setSelectedBoxes(prevState => [...prevState, code]);
    } else {
      setSelectedBoxes(prevState => prevState.filter(val => val !== code));
    }
  };

  const onSelectedChange = checkedValues => {
    const selected = JSON.parse(checkedValues);
    console.log(selected);
    const selectedMapping = activeTerminology?.codes?.find(
      term => term.code === selected.code
    );
    // Updates selectedMappings and displaySelectedMappings to include the new selected items
    setSelectedMappings(prevState => [...prevState, selectedMapping]);

    // Adds the selectedMappings to the selectedBoxes to ensure they are checked
    setSelectedBoxes(prevState => {
      const updated = [...prevState, selectedMapping];
      // Sets the values for the form to the selectedMappingss checkboxes that are checked
      form.setFieldsValue({ selected_mappings: updated });
      return updated;
    });

    setDisplaySelectedMappings(prevState => [...prevState, selectedMapping]);

    // Filters out the selected checkboxes from the results being displayed
    const updatedMappings = activeTerminology?.codes?.filter(
      term => term.code !== selected.code
    );
    setActiveTerminology(updatedMappings);
  };

  const selectedCodesDisplay = (selected, index) => {
    return (
      <>
        <div key={index} className="modal_display_result">
          <div>
            <div className="modal_term_ontology">
              <div>{selected?.code}</div>
            </div>
            <div>{selected?.display}</div>
            <div>{ellipsisString(selected?.description, '100')}</div>
          </div>
        </div>
      </>
    );
  };

  const checkBoxDisplay = (item, index) => {
    return (
      <>
        <div key={index} className="modal_search_result">
          <div key={index} className="modal_display_result">
            <div>
              <div className="modal_term_ontology">
                <div>{item.code}</div>
              </div>
              <div>{item.display}</div>
              <div>{ellipsisString(item?.description, '100')}</div>
            </div>
          </div>
        </div>
      </>
    );
  };
  const mappedTerminology = () => {
    const activeTerminology = terminologiesToMap.find(
      term => term.id === active
    );

    // If no activeTerminology or codes, return null
    if (!activeTerminology || activeTerminology.codes.length === 0) return null;

    return (
      <Form form={form} layout="vertical">
        {displaySelectedMappings?.length > 0 && (
          <Form.Item
            name="selected_mappings"
            valuePropName="value"
            rules={[{ required: false }]}
          >
            <div className="modal_display_results">
              {displaySelectedMappings?.map((selected, i) => (
                <Checkbox
                  key={i}
                  checked={selectedBoxes?.some(
                    box => box?.code === selected?.code
                  )}
                  value={selected}
                  onChange={e => onCheckboxChange(e, selected, i)}
                >
                  {selectedCodesDisplay(selected, i)}
                </Checkbox>
              ))}
            </div>
          </Form.Item>
        )}

        <Form.Item
          name={['mappings']}
          valuePropName="value"
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Checkbox.Group
            className="mappings_checkbox"
            options={activeTerminology.codes.map((code, index) => ({
              value: JSON.stringify({
                code: code.code,
                display: code.display,
                description: code.description,
                system: code.system,
              }),
              label: checkBoxDisplay(code, index),
            }))}
            onChange={onSelectedChange}
          />
        </Form.Item>
      </Form>
    );
  };

  return (
    <>
      <div className="assign_map_checkbox_container">
        <div className="assign_map_checkbox_wrapper">
          {terminologiesToMap.map((term, i) => (
            <div
              key={i}
              className={active === term.id ? 'active_term' : 'inactive_term'}
              onClick={() => setActive(term.id)}
            >
              {term.name}
            </div>
          ))}
        </div>
        <div className="assign_map_checkboxes">{mappedTerminology()}</div>
      </div>
    </>
  );
};
