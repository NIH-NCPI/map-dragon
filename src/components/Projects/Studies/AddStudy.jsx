import { React, useContext, useState } from 'react';
import { myContext } from '../../../App';
import './StudyStyling.scss';
import { Form, Input, message, notification, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ModalSpinner } from '../../Manager/Spinner';

export const AddStudy = ({ addStudy, setAddStudy }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { vocabUrl, setStudy } = useContext(myContext);
  const { TextArea } = Input;

  const navigate = useNavigate();
  // Submit function for adding a new study.
  // The funciton to make the POST request is called with the values to put into the body of the request.
  // The user is then redirected to the new study created.
  const handleSubmit = values => {
    setLoading(true);
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
        form.resetFields();
        setAddStudy(false);
        message.success('Study added successfully.');
        navigate(`/study/${data.id}`);
      })
      .finally(() => setLoading(false));
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
        })
      }
      onCancel={() => {
        form.resetFields();
        setAddStudy(false);
      }}
      maskClosable={false}
      cancelButtonProps={{ disabled: loading }}
      okButtonProps={{ disabled: loading }}
      closeIcon={false}
    >
      {loading ? (
        <ModalSpinner />
      ) : (
        <Form form={form} layout="vertical" name="form_in_modal">
          <h2>Create Study</h2>
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
            label="System"
            rules={[{ required: true, message: 'Please input Study system.' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};
