import { Form, Input, message, Modal } from 'antd';
import { useContext } from 'react';
import { myContext } from '../../../App';
import { handleUpdate } from '../../Manager/FetchManager';

export const EditTableDetails = ({ form, table, setTable, edit, setEdit }) => {
  const { vocabUrl } = useContext(myContext);
  // Sets the initial values displayed in the form and esnures they are current
  const changeHandler = () => {
    form.setFieldsValue({
      name: table.name,
      description: table.description,
      url: table.url,
    });
  };

  // Submit function for the modal to edit the table name, description, and url.
  // The function adds the variables and filename to the body of the PUT request to retain the complete
  // table object, since only 3 parts (captured in "values" through ant.d functionality) are being edited.
  const handleSubmit = values => {
    handleUpdate(vocabUrl, 'Table', table, {
      ...values,
      filename: table.filename,
      variables: table?.variables,
    })
      .then(data => setTable(data))
      // Displays a self-closing message that the udpates have been successfully saved.
      .then(() => message.success('Changes saved successfully.'));
  };
  return (
    <>
      {/* Modal to edit details */}
      <Modal
        open={edit}
        width={'51%'}
        onOk={() =>
          form.validateFields().then(values => {
            form.resetFields();
            setEdit(false);
            handleSubmit(values);
          })
        }
        onCancel={() => {
          form.resetFields();
          setEdit(false);
        }}
        maskClosable={false}
        closeIcon={false}
        destroyOnClose={true}
      >
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
      </Modal>
    </>
  );
};
