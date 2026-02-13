import { Form, Input, Modal, notification, message } from 'antd';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { handleUpdate } from '../../Manager/FetchManager';
import { ModalSpinner } from '../../Manager/Spinner';

export const EditDDDetails = ({
  form,
  dataDictionary,
  setDataDictionary,
  edit,
  setEdit,
}) => {
  const [loading, setLoading] = useState(false);
  const { vocabUrl } = useContext(myContext);
  // Sets the initial values displayed in the form and esnures they are current
  const changeHandler = () => {
    form.setFieldsValue({
      name: dataDictionary.name,
      description: dataDictionary.description,
    });
  };

  // Submit function for the modal to edit the study name, description, and url.
  // The function adds the variables and filename to the body of the PUT request to retain the complete
  // study object, since only 3 parts (captured in "values" through ant.d functionality) are being edited.
  const handleSubmit = values => {
    setLoading(true);
    handleUpdate(vocabUrl, 'DataDictionary', dataDictionary, {
      ...values,
      tables: dataDictionary?.tables,
    })
      .then(data => {
        setDataDictionary(data);
        form.resetFields();
        setEdit(false);
        message.success('Changes saved successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred editing the Data Dictionary. Please try again.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
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
        maskClosable={false}
        closeIcon={false}
        destroyOnHidden={true}
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
            <h2>
              {dataDictionary.name ? dataDictionary.name : dataDictionary.id}
            </h2>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                {
                  required: true,
                  message: 'Please input Data Dictionary name.',
                },
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
        )}
      </Modal>
    </>
  );
};
