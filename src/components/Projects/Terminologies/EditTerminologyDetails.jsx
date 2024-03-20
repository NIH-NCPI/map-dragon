import { Form, Input } from 'antd';

export const EditTerminologyDetails = ({ form, terminology }) => {
  // Sets the initial values displayed in the form and esnures they are current
  const changeHandler = () => {
    form.setFieldsValue({
      name: terminology.name,
      description: terminology.description,
      url: terminology.url,
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
        <h2>{terminology.name ? terminology.name : terminology.id}</h2>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Please input terminology name.' },
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
        <Form.Item
          name="url"
          label="URL"
          rules={[{ required: true, message: 'Please input terminology URL.' }]}
        >
          <Input />
        </Form.Item>{' '}
      </Form>
    </>
  );
};
