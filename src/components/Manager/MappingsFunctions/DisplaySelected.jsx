import { Checkbox, Form, Tooltip } from 'antd';
import { ellipsisString } from '../Utilitiy';

export const DisplaySelected = ({
  displaySelectedMappings,
  selectedBoxes,
  setSelectedBoxes,
}) => {
  const selectedCodesDisplay = (selected, index) => {
    return (
      <>
        <div key={index} className="modal_display_result">
          <div>
            <div className="modal_term_ontology">
              <div>{selected?.code}</div>
            </div>
            <div>{selected?.display || selected?.label}</div>
            <div>
              {selected?.description?.length > 85 ? (
                <Tooltip
                  placement="topRight"
                  mouseEnterDelay={0.5}
                  title={selected?.description}
                >
                  {ellipsisString(
                    Array.isArray(selected.description)
                      ? selected.description[0]
                      : selected.description,
                    '85'
                  )}
                </Tooltip>
              ) : (
                ellipsisString(
                  Array.isArray(selected.description)
                    ? selected.description[0]
                    : selected.description,
                  '85'
                )
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  const onCheckboxChange = (event, code) => {
    if (event.target.checked) {
      setSelectedBoxes(prevState => [...prevState, code]);
    } else {
      setSelectedBoxes(prevState => prevState.filter(val => val !== code));
    }
  };

  return (
    <>
      {displaySelectedMappings?.length > 0 && (
        <>
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
        </>
      )}
    </>
  );
};
