import { useEffect, useState } from 'react';
import { Checkbox, Form, Tooltip } from 'antd';
import { ellipsisString } from '../Utilitiy';
import { APISearchBar } from '../../Projects/Terminologies/APISearchBar';
import { DisplaySelected } from './DisplaySelected';
import { APIResults } from '../../Projects/Terminologies/APIResults';

export const AssignMappingsCheckboxes = ({
  terminologiesToMap,
  form,
  selectedBoxes,
  setSelectedBoxes,
  searchProp,
}) => {
  const [active, setActive] = useState(null);
  const [displaySelectedMappings, setDisplaySelectedMappings] = useState([]);
  const [allCheckboxes, setAllCheckboxes] = useState([]);
  const [loading, setLoading] = useState(false);

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
      <Form form={form} layout="vertical">
        <DisplaySelected
          displaySelectedMappings={displaySelectedMappings}
          form={form}
          selectedBoxes={selectedBoxes}
          setSelectedBoxes={setSelectedBoxes}
        />
        {active === 'search' ? (
          <APIResults
            loading={loading}
            displaySelectedMappings={displaySelectedMappings}
            onSelectedChange={onSelectedChange}
          />
        ) : (
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
        )}
      </Form>
    );
  };

  return (
    <>
      {terminologiesToMap?.length && (
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
            <APISearchBar
              active={active}
              setActive={setActive}
              searchProp={searchProp}
              selectedBoxes={selectedBoxes}
              setLoading={setLoading}
            />
          </div>
          <div className="assign_map_checkboxes">{mappedTerminology()}</div>
        </div>
      )}
    </>
  );
};
