import { Form, Input } from 'antd';

export const EditDDDetails = ({ form, dataDictionary }) => {
  // Sets the initial values displayed in the form and esnures they are current
  const changeHandler = () => {
    form.setFieldsValue({
      name: dataDictionary.name,
      description: dataDictionary.description,
    });
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        onChange={changeHandler()}
      >
        <h2>{dataDictionary.name ? dataDictionary.name : dataDictionary.id}</h2>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Please input Data Dictionary name.' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: false }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </>
  );
};
