import { Checkbox, Form } from 'antd';
import { ontologyCounts } from '../Utilitiy';

export const OntologyCheckboxes = ({ facetCounts, apiPreferences }) => {
  const formattedFacetCounts = ontologyCounts(facetCounts);

  return (
    <div className="ontology_form">
      <Form.Item
        name="selected_ontologies"
        valuePropName="value"
        rules={[{ required: false }]}
      >
        <div className="modal_display_results">
          {formattedFacetCounts?.map((fc, i) => {
            const key = Object.keys(fc)[0];
            const value = fc[key];

            return (
              <Checkbox key={i} value={key}>
                {`${key.toUpperCase()} ${value !== '0' ? `(${value})` : ''}`}
              </Checkbox>
            );
          })}
        </div>
      </Form.Item>
    </div>
  );
};
