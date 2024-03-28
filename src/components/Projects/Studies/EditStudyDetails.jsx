import { Form, Input } from 'antd';

export const EditStudyDetails = ({ form, study }) => {
  // Sets the initial values displayed in the form and esnures they are current
  const changeHandler = () => {
    form.setFieldsValue({
      name: study.name,
      description: study.description,
      url: study.url,
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
        <h2>{study.name ? study.name : study.id}</h2>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input Study name.' }]}
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
          rules={[{ required: true, message: 'Please input Study URL.' }]}
        >
          <Input />
        </Form.Item>{' '}
      </Form>
    </>
  );
};
