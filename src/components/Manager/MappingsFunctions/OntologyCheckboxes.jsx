import { Checkbox, Form } from 'antd';

export const OntologyCheckboxes = ({ facetCounts, apiPreferences }) => {
  const ontologyCheckboxDisplay = fc => {
    // Extract the key (assuming it's only one key in the object)
    const key = Object.keys(fc);
    console.log(fc);
    const value = fc[key]; // Get the value for that key

    return `${key} (${value})`; // Format it to "KEY (value)"
  };

  console.log(apiPreferences);

  return (
    <div className="ontology_form">
      <Form.Item
        name="selected_ontologies"
        valuePropName="value"
        rules={[{ required: false }]}
      >
        <div className="modal_display_results">
          {facetCounts?.map((fc, i) => {
            // Check if the index is even (assuming even index = key and odd index = value)
            if (i % 2 === 0) {
              const key = fc.toUpperCase(); // Use the current string as the key (uppercase)
              const value = facetCounts[i + 1]; // The next element as the value

              return (
                <Checkbox
                  key={i}
                  //   disabled={value === '0'}
                  // checked={selectedBoxes.some(box => box.obo_id === fc.obo_id)} // Uncomment if needed
                  value={fc} // You can keep this if you need the whole object
                  // onChange={(e) => onCheckboxChange(e, sm, i)} // Uncomment if needed
                >
                  {`${key} ${value !== '0' ? `(${value})` : ''}`}

                  {/* Display formatted key-value pair */}
                </Checkbox>
              );
            }
            return null; // Skip odd indexed elements
          })}
        </div>
      </Form.Item>
    </div>
  );
};
