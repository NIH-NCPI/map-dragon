import { useEffect, useState } from 'react';
import { Checkbox, Form, Tooltip } from 'antd';
import { ellipsisString } from '../Utilitiy';

export const AssignMappingsCheckboxes = ({
  terminologiesToMap,
  form,
  selectedBoxes,
  setSelectedBoxes,
}) => {
  const [active, setActive] = useState(null);
  const [displaySelectedMappings, setDisplaySelectedMappings] = useState([]);
  const [allCheckboxes, setAllCheckboxes] = useState([]);

  useEffect(() => {
    setActive(terminologiesToMap?.[0]?.id);
  }, [terminologiesToMap]);

  useEffect(() => {
    setAllCheckboxes(
      terminologiesToMap.find(term => term.id === active)?.codes ?? []
    );
  }, [active]);

  useEffect(() => {
    form.setFieldsValue({
      selected_terminologies: selectedBoxes,
    });
  }, [selectedBoxes, form]);

  const onCheckboxChange = (event, code) => {
    if (event.target.checked) {
      setSelectedBoxes(prevState => [...prevState, code]);
    } else {
      setSelectedBoxes(prevState => prevState.filter(val => val !== code));
    }
  };

  const onSelectedChange = checkedValues => {
    const selected = JSON.parse(checkedValues?.[checkedValues.length - 1]);

    // Adds the selectedMappings to the selectedBoxes to ensure they are checked
    setSelectedBoxes(prevState => {
      const updated = [...prevState, selected];
      // Sets the values for the form to the selectedMappings checkboxes that are checked
      form.setFieldsValue({ selected_mappings: updated });
      return updated;
    });

    setDisplaySelectedMappings(prevState => [...prevState, selected]);
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
            <div>
              {selected?.description?.length > 85 ? (
                <Tooltip
                  placement="topRight"
                  mouseEnterDelay={0.5}
                  title={selected?.description}
                >
                  {ellipsisString(selected?.description, '85')}
                </Tooltip>
              ) : (
                ellipsisString(selected?.description, '85')
              )}
            </div>
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
              <div>
                {item?.description?.length > 85 ? (
                  <Tooltip
                    placement="topRight"
                    mouseEnterDelay={0.5}
                    title={item?.description}
                  >
                    {ellipsisString(item?.description, '85')}
                  </Tooltip>
                ) : (
                  ellipsisString(item?.description, '85')
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };
  const mappedTerminology = () => {
    return (
      allCheckboxes.length > 0 && (
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
                    onChange={e => onCheckboxChange(e, selected)}
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
              options={allCheckboxes
                .filter(
                  checkbox =>
                    !displaySelectedMappings.some(
                      dsm => checkbox.code === dsm.code
                    )
                )
                .map((code, index) => ({
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
      )
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
