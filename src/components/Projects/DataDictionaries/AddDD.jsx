import { React, useContext, useEffect } from 'react';
import { myContext } from '../../../App';
import { Form, Input, Select, Modal } from 'antd';
import './DDStyling.scss';
import { handlePost, handleUpdate } from '../../Manager/FetchManager';

export const AddDD = ({ addDD, setAddDD, study }) => {
  const [form] = Form.useForm();
  const { vocabUrl, dataDictionary, setDataDictionary } = useContext(myContext);

  const newDDArray = [...study.datadictionary];

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
        Navigate(`DataDictionary/${data.id}`);
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

  console.log(study);

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
