import { Form, Input, Modal, message } from 'antd';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { handleUpdate } from '../../Manager/FetchManager';
import { ModalSpinner } from '../../Manager/Spinner';

export const EditTerminologyDetails = ({
  form,
  terminology,
  setTerminology,
}) => {
  const [loading, setLoading] = useState(false);
  const { edit, setEdit, vocabUrl, user } = useContext(myContext);
  // Sets the initial values displayed in the form and esnures they are current
  const changeHandler = () => {
    form.setFieldsValue({
      name: terminology?.name,
      description: terminology?.description,
      url: terminology?.url,
    });
  };

  // Submit function for the modal to edit the terminology name, description, and url.
  // The function adds the codes to the body of the PUT request to retain the complete
  // terminology object, since only 3 parts (captured in "values" through ant.d functionality) are being edited.
  const handleSubmit = values => {
    setLoading(true);
    handleUpdate(vocabUrl, 'Terminology', terminology, {
      ...values,
      codes: terminology?.codes,
    })
      .then(data => {
        setTerminology(data);
        form.resetFields();
        setEdit(false);
      })
      // Displays a self-closing message that the udpates have been successfully saved.
      .then(() => message.success('Changes saved successfully.'))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Modal
        forceRender
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
        maskClosable={false}
        closeIcon={false}
        destroyOnClose={true}
        cancelButtonProps={{ disabled: loading }}
        okButtonProps={{ disabled: loading }}
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
            <h2>{terminology?.name ? terminology?.name : terminology?.id}</h2>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: 'Please input Terminology name.' },
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
              label="System"
              rules={[
                { required: true, message: 'Please input Terminology system.' },
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
