import { React, useContext } from 'react';
import { myContext } from '../../../App';
import { Form, Input, notification, message, Modal } from 'antd';
import './DDStyling.scss';
import { handlePost, handleUpdate } from '../../Manager/FetchManager';
import { useNavigate } from 'react-router-dom';

export const AddDD = ({ addDD, setAddDD, study }) => {
  const [form] = Form.useForm();
  const { vocabUrl, setDataDictionary } = useContext(myContext);

  const navigate = useNavigate();
  // copy of datadictionary array in study

  //POST call to create a new data dictionary(DD) in a study
  // POST for new DD. Then the id from the new DD is pushed to the
  // copy of the datadictionary array in the study. The value of the
  // datadictionary array is set to the copy with the new DD.
  const handleSubmit = values => {
    const newDDArray = [...study.datadictionary];
    handlePost(vocabUrl, 'DataDictionary', {
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
        message.success('Data Dictionary added successfully.');

        navigate(`/DataDictionary/${data.id}`);
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error adding the Data Dictionary. Please try again.',
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
      destroyOnClose={true}
    >
      <Form form={form} layout="vertical" name="form_in_modal" preserve={false}>
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
