import { React, useContext } from 'react';
import { myContext } from '../../../App';
import './StudyStyling.scss';
import { Form, Input, message, notification, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';

export const AddStudy = ({ addStudy, setAddStudy }) => {
  const [form] = Form.useForm();
  const { vocabUrl, setStudy } = useContext(myContext);

  const navigate = useNavigate();
  // Submit function for adding a new study.
  // The funciton to make the POST request is called with the values to put into the body of the request.
  // The user is then redirected to the new study created.
  const handleSubmit = values => {
    fetch(`${vocabUrl}/Study`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...values,
        datadictionary: [],
      }),
    })
      .then(res => {
        if (res.status === 201) {
          return res.json();
        } else {
          notification.error({
            message: 'Error',
            description:
              'An error occurred creating the Study. Please try again.',
          });
        }
      })
      .then(data => {
        setStudy(data);
        message.success('Study added successfully.');
        navigate(`/study/${data.id}`);
      });
  };

  // ant.design Form is returned where the user can manually input a new study
  // Input fields include name (required), description, title, identifier prefix (required), url (required)
  // and a multi-select of data dictionaries to choose from (at least 1 required)
  return (
    <Modal
      open={addStudy}
      width={'70%'}
      onOk={() =>
        form.validateFields().then(values => {
          handleSubmit(values);
          form.resetFields();
          setAddStudy(false);
        })
      }
      onCancel={() => {
        form.resetFields();
        setAddStudy(false);
      }}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" name="form_in_modal">
        <h2>Create Study</h2>
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
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please input Study title.' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="identifier_prefix"
          label="Identifier Prefix"
          rules={[
            {
              required: true,
              message: 'Please input Study identifier prefix.',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="url"
          label="URL"
          rules={[{ required: true, message: 'Please input Study URL.' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
