import { Form, Input, message, Modal } from 'antd';
import { ModalSpinner } from '../../Manager/Spinner';
import { handleUpdate } from '../../Manager/FetchManager';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';

export const EditStudyDetails = ({ form, study, setStudy, edit, setEdit }) => {
  const [loading, setLoading] = useState(false);
  const { vocabUrl } = useContext(myContext);
  const { TextArea } = Input;

  // Sets the initial values displayed in the form and esnures they are current
  const changeHandler = () => {
    form.setFieldsValue({
      name: study.name,
      title: study.title,
      description: study.description,
      url: study.url,
    });
  };

  const handleSubmit = values => {
    setLoading(true);
    handleUpdate(vocabUrl, 'Study', study, {
      ...values,
      datadictionary: study?.datadictionary,
    })
      .then(data => {
        setStudy(data);
        form.resetFields();
        setEdit(false);
      })
      .then(() => message.success('Changes saved successfully.'))

      .finally(() => setLoading(false));
    // Displays a self-closing message that the udpates have been successfully saved.
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
            <h2>{study.name ? study.name : study.id}</h2>
            <Form.Item
              name="name"
              label="Name / Short Code"
              rules={[{ required: true, message: 'Please input Study name.' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please input Study title.' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: false }]}
            >
              <TextArea />
            </Form.Item>
            <Form.Item
              name="url"
              label="System"
              rules={[
                { required: true, message: 'Please input Study system.' },
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
};
