import { Form, Input, Modal, message } from 'antd';
import { useContext } from 'react';
import { myContext } from '../../../App';
import { handleUpdate } from '../../Manager/FetchManager';

export const EditTerminologyDetails = ({
  form,
  terminology,
  setTerminology,
}) => {
  const { edit, setEdit, vocabUrl } = useContext(myContext);
  // Sets the initial values displayed in the form and esnures they are current
  const changeHandler = () => {
    form.setFieldsValue({
      name: terminology.name,
      description: terminology.description,
      url: terminology.url,
    });
  };

  // Submit function for the modal to edit the terminology name, description, and url.
  // The function adds the codes to the body of the PUT request to retain the complete
  // terminology object, since only 3 parts (captured in "values" through ant.d functionality) are being edited.
  const handleSubmit = values => {
    handleUpdate(vocabUrl, 'Terminology', terminology, {
      ...values,
      codes: terminology?.codes,
    })
      .then(data => setTerminology(data))
      // Displays a self-closing message that the udpates have been successfully saved.
      .then(() => message.success('Changes saved successfully.'));
  };

  return (
    <>
      {' '}
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
            rules={[
              { required: true, message: 'Please input terminology URL.' },
            ]}
          >
            <Input />
          </Form.Item>{' '}
        </Form>
      </Modal>
    </>
  );
};
