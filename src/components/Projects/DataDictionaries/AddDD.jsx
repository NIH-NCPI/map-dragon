import { React, useContext, useState } from 'react';
import { myContext } from '../../../App';
import { Form, Input, notification, message, Modal } from 'antd';
import './DDStyling.scss';
import { handlePost, handleUpdate } from '../../Manager/FetchManager';
import { useNavigate, useParams } from 'react-router-dom';
import { ModalSpinner } from '../../Manager/Spinner';

export const AddDD = ({ addDD, setAddDD, study }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { studyId } = useParams();
  const { vocabUrl, setDataDictionary } = useContext(myContext);

  const navigate = useNavigate();
  // copy of datadictionary array in study

  //POST call to create a new data dictionary(DD) in a study
  // POST for new DD. Then the id from the new DD is pushed to the
  // copy of the datadictionary array in the study. The value of the
  // datadictionary array is set to the copy with the new DD.
  const handleSubmit = values => {
    setLoading(true);
    const newDDArray = [...study.datadictionary];
    handlePost(vocabUrl, 'DataDictionary', {
      ...values,
      tables: [],
    })
      .then(data => {
        setDataDictionary(data);
        form.resetFields();
        setAddDD(false);
        newDDArray.push({ 'reference': `DataDictionary/${data.id}` });

        handleUpdate(vocabUrl, 'Study', study, {
          ...study,
          datadictionary: newDDArray,
        });
        message.success('Data Dictionary added successfully.');

        navigate(`/Study/${studyId}/DataDictionary/${data.id}`);
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred adding the Data Dictionary. Please try again.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      open={addDD}
      width={'70%'}
      onOk={() =>
        form.validateFields().then(values => {
          handleSubmit(values);
        })
      }
      onCancel={() => {
        form.resetFields();
        setAddDD(false);
      }}
      maskClosable={false}
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
          name="form_in_modal"
          preserve={false}
        >
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
        </Form>
      )}
    </Modal>
  );
};
