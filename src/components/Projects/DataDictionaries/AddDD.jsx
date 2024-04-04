import { React, useContext, useEffect } from 'react';
import { myContext } from '../../../App';
import { Form, Input, Select, Modal } from 'antd';
import './DDStyling.scss';
import { handlePost, handleUpdate } from '../../Manager/FetchManager';
import { useNavigate } from 'react-router-dom';

export const AddDD = ({ addDD, setAddDD, study }) => {
  const [form] = Form.useForm();
  const { vocabUrl, setDataDictionary } = useContext(myContext);

  const navigate = useNavigate();
  // copy of datadictionary array in study
  const newDDArray = [...study.datadictionary];

  //POST call to create a new data dictionary(DD) in a study
  // POST for new DD. Then the id from the new DD is pushed to the
  // copy of the datadictionary array in the study. The value of the
  // datadictionary array is set to the copy with the new DD.
  const handleSubmit = values => {
    handlePost(vocabUrl, 'DataDictionary', values, {
      ...values,
      tables: [],
    })
      .then(data => {
        setDataDictionary(data);
        newDDArray.push({ 'reference': `DataDictionary/${data.id}` });

        handleUpdate(vocabUrl, 'Study', study, {
          ...study,
          datadictionary: newDDArray,
        });
        navigate(`DataDictionary/${data.id}`);
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.',
          });
        }
        return error;
      });
  };

  return (
    <Modal
      open={addDD}
      width={'70%'}
      onOk={() =>
        form.validateFields().then(values => {
          console.log(values);
          handleSubmit(values);
          form.resetFields();
          setAddDD(false);
        })
      }
      onCancel={() => {
        form.resetFields();
        setAddDD(false);
      }}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" name="form_in_modal">
        <h2>Create Data Dictionary</h2>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Please input Data Dictionary name.' },
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
      </Form>{' '}
    </Modal>
  );
};
