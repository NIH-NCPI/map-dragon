import { Checkbox, Form } from 'antd';

export const FilterOntology = ({ ontology, form }) => {
  console.log(ontology);

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
    <Form.Item name={'selected_ontologies'} valuePropName="value">
      <Checkbox.Group
        className="mappings_checkbox"
        options={ontology.flatMap(item =>
          Object.values(item?.ontologies).map((ont, i) => ({
            value: JSON.stringify({
              selected_ontology: ont.ontology_code,
            }),
            label: checkBoxDisplay(ont, i),
          }))
        )}
      />
    </Form.Item>
  );
};
