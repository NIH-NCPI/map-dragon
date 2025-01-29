import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { Button, Form, Input, message, Modal, Select, Space } from 'antd';
import DataTypeSubForm from './DataTypeSubForm';
import { ModalSpinner } from '../../Manager/Spinner';
import { RequiredLogin } from '../../Auth/RequiredLogin';

export const AddVariable = ({ table, setTable }) => {
  const { vocabUrl, user } = useContext(myContext);
  const [addRow, setAddRow] = useState(false);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);

  const { TextArea } = Input;
  const [form] = Form.useForm();

  const handleSuccess = () => {
    setAddRow(true);
  };
  const login = RequiredLogin({ handleSuccess: handleSuccess });

  const handleSubmit = values => {
    setLoading(true);

    fetch(`${vocabUrl}/Table/${table.id}/variable/${values.name}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...values, editor: user.email }),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => {
        setTable(data);
        form.resetFields();
        setAddRow(false);
      })
      // Displays a self-closing message that the udpates have been successfully saved.
      .then(() => message.success('Variable added successfully.'))
      .finally(() => setLoading(false));
  };

  const validateUnique = (_, value) => {
    // Validator function for form. Checks if the term being added already exists.
    const isUnique = !table.variables.some(
      item => item?.name?.toLowerCase() === value?.toLowerCase()
    );

    if (isUnique) {
      return Promise.resolve();
    } else {
      return Promise.reject(
        new Error(`"${value}" already exists. Please choose a different name.`)
      );
    }
  };

  return (
    <>
      <Button
        onClick={() => (user ? setAddRow(true) : login())}
        type="primary"
        style={{
          marginBottom: 16,
        }}
        // disabled={addRow}
      >
        Add variable
      </Button>
      <Modal
        open={addRow}
        width={'70%'}
        onOk={() => {
          form.validateFields().then(values => {
            handleSubmit(values);
            setType('');
          });
        }}
        onCancel={() => {
          form.resetFields();
          setAddRow(false);
          setType('');
        }}
        maskClosable={false}
        closeIcon={false}
        cancelButtonProps={{ disabled: loading }}
        okButtonProps={{ disabled: loading }}
      >
        {loading ? (
          <ModalSpinner />
        ) : (
          <Form form={form} layout="vertical">
            <Space
              style={{
                display: 'flex',
                marginBottom: 3,
              }}
              align="baseline"
            >
              <Form.Item
                name={['name']}
                label="Variable name"
                rules={[
                  { required: true, message: 'Input variable name.' },
                  { validator: validateUnique },
                ]}
              >
                <Input
                  style={{
                    width: '15vw',
                  }}
                  autoFocus
                />
              </Form.Item>
              <Form.Item
                name={['description']}
                label="Variable description"
                rules={[
                  {
                    required: true,
                    message: 'Input variable description.',
                  },
                ]}
              >
                <TextArea
                  rows={1}
                  style={{
                    width: '39vw',
                  }}
                  autoFocus
                />
              </Form.Item>
              <Form.Item
                label="Data Type"
                name={['data_type']}
                rules={[
                  {
                    required: true,
                    message: 'Select data type.',
                  },
                ]}
              >
                <Select
                  style={{ width: '10vw' }}
                  placeholder="Select data type"
                  onChange={value => {
                    setType(value);
                  }}
                  options={[
                    { value: 'ENUMERATION', label: 'Enumeration' },
                    { value: 'INTEGER', label: 'Integer' },
                    { value: 'QUANTITY', label: 'Quantity' },
                    { value: 'STRING', label: 'String' },
                  ]}
                />
              </Form.Item>
            </Space>
            <DataTypeSubForm form={form} type={type} />
          </Form>
        )}
      </Modal>
    </>
  );
};
