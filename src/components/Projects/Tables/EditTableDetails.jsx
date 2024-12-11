import { Form, Input, message, Modal, notification } from 'antd';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { handleUpdate } from '../../Manager/FetchManager';
import { ModalSpinner } from '../../Manager/Spinner';

export const EditTableDetails = ({ table, setTable, edit, setEdit }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { vocabUrl, user } = useContext(myContext);
  // Sets the initial values displayed in the form and esnures they are current
  const changeHandler = () => {
    form.setFieldsValue({
      name: table?.name,
      description: table?.description,
      url: table?.url,
    });
  };

  // Submit function for the modal to edit the table name, description, and url.
  // The function adds the variables and filename to the body of the PUT request to retain the complete
  // table object, since only 3 parts (captured in "values" through ant.d functionality) are being edited.
  const handleSubmit = values => {
    setLoading(true);
    handleUpdate(vocabUrl, 'Table', table, {
      ...values,
      filename: table.filename,
      variables: table?.variables,
      // editor: user.email,
    })
      .then(data => {
        setTable(data);
        setEdit(false);
        form.resetFields();
      })
      // Displays a self-closing message that the udpates have been successfully saved.
      .then(() => message.success('Changes saved successfully.'))
      .catch(error => {
        notification.error({
          message: 'Error',
          description: 'An error occurred editing the Table.',
        });
      })
      .finally(() => setLoading(false));
  };
  return (
    <>
      {/* Modal to edit details */}
      <Modal
        open={edit}
        width={'51%'}
        onOk={() =>
          form.validateFields().then(values => {
            handleSubmit(values);
          })
        }
        onCancel={() => {
          form.resetFields();
          setEdit(false);
        }}
        cancelButtonProps={{ disabled: loading }}
        okButtonProps={{ disabled: loading }}
        maskClosable={false}
        closeIcon={false}
        destroyOnClose={true}
      >
        {loading ? (
          <ModalSpinner />
        ) : (
          <Form
            form={form}
            layout="vertical"
            preserve={false}
            onChange={changeHandler()}
          >
            <h2>{table?.name ? table?.name : table?.id}</h2>
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
              label="System"
              rules={[
                { required: true, message: 'Please input Table system.' },
              ]}
            >
              <Input />
            </Form.Item>{' '}
          </Form>
        )}
      </Modal>
    </>
  );
};
