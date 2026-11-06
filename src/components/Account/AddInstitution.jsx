import { Input, Form, message, Modal, notification, Select, Spin } from 'antd';
import { getAll, handlePost } from '../Manager/FetchManager';
import { useContext, useState } from 'react';
import { myContext } from '../../App';
import { useNavigate } from 'react-router-dom';

export const AddInstitution = ({ addInst, setAddInst, setInstitutions }) => {
  const [form] = Form.useForm();
  const { vocabUrl } = useContext(myContext);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = values => {
    setLoading(true);
    const emailList = (values?.allowedEmails ?? [])
      .map(e => e.trim())
      .filter(Boolean);

    handlePost(vocabUrl, 'admin/institutions', {
      id: values.id,
      name: values.name,
      allowedEmails: emailList
    })
      .then(() => getAll(vocabUrl, 'admin/institutions', navigate))
      .then(data => {
        setAddInst(false);
        setInstitutions(data);
        message.success(`${values.name} added successfully`);
      })
      .catch(error => {
        console.log('status:', error.status, 'message:', error.message, error);
        notification.error({
          message: 'Error',
          description:
            error.message ??
            `An error occurred adding institution, ${values.name}.`
        });
      })
      .finally(() => setLoading(false));
  };
  return (
    <Modal
      open={addInst}
      width={'50%'}
      onOk={() =>
        form.validateFields().then(values => {
          handleSubmit(values);
        })
      }
      onCancel={() => {
        form.resetFields();
        setAddInst(false);
      }}
      closable={false}
      destroyOnHidden={true}
      maskClosable={false}
    >
      {loading && (
        <div className="loading_overlay_modal">
          <Spin />
        </div>
      )}
      <Form form={form} layout="vertical" preserve={false}>
        <h2>Add Institution</h2>

        <Form.Item
          name="id"
          label="Id"
          rules={[
            {
              required: true,
              message: 'Please input institution id.'
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {
              required: true,
              message: 'Please input institution name.'
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="allowedEmails"
          label="Users"
          rules={[
            {
              type: 'array',
              placeholder: 'Add email(s)',
              defaultField: {
                type: 'email',
                message: 'Please input a valid email address.'
              }
            }
          ]}
        >
          <Select
            mode="tags"
            tokenSeparators={[',', ' ']}
            open={false}
            // autoComplete="off"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
