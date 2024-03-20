import { Form, Input } from 'antd';

export const EditTableDetails = ({ form, table }) => {
  // Sets the initial values displayed in the form and esnures they are current
  const changeHandler = () => {
    form.setFieldsValue({
      name: table.name,
      description: table.description,
      url: table.url,
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
        <h2>{table.name ? table.name : table.id}</h2>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input Table name.' }]}
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
          rules={[{ required: true, message: 'Please input Table URL.' }]}
        >
          <Input />
        </Form.Item>{' '}
      </Form>
    </>
  );
};
