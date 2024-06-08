import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { Button, Form, Input, message, Modal, Select, Space } from 'antd';
import DataTypeSubForm from './DataTypeSubForm';

export const AddVariable = ({ table, setTable }) => {
  const { vocabUrl } = useContext(myContext);
  const [addRow, setAddRow] = useState(false);
  const [type, setType] = useState('');
  const { TextArea } = Input;
  const [form] = Form.useForm();

  const handleSubmit = values => {
    // Checks if the variable being added already exists in the variables array.
    // Displays error message if it does.
    table.variables.some(
      item => item.name.toLowerCase() === values.name.toLowerCase()
    )
      ? message.error(
          `"${values.name}" already exists in the Table. Please choose a different name.`
        )
      : fetch(`${vocabUrl}/Table/${table.id}/variable/${values.name}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })
          .then(res => {
            if (res.ok) {
              return res.json();
            } else {
              throw new Error('An unknown error occurred.');
            }
          })
          .then(data => setTable(data))
          .then(() => setAddRow(false))
          // Displays a self-closing message that the udpates have been successfully saved.
          .then(() => message.success('Variable added successfully.'));
  };

  return (
    <>
      <div className="add_row_button">
        <Button
          onClick={() => setAddRow(true)}
          type="primary"
          style={{
            marginBottom: 16,
          }}
          // disabled={addRow}
        >
          Add variable
        </Button>
      </div>
      <Modal
        open={addRow}
        width={'70%'}
        onOk={() =>
          form.validateFields().then(values => {
            handleSubmit(values);
            form.resetFields();
            setType('');
          })
        }
        onCancel={() => {
          form.resetFields();
          setAddRow(false);
          setType('');
        }}
        maskClosable={false}
      >
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
              rules={[{ required: true, message: 'Input variable name' }]}
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
                { required: true, message: 'Input variable description' },
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
                  { value: 'STRING', label: 'String' },
                  { value: 'INTEGER', label: 'Integer' },
                  { value: 'QUANTITY', label: 'Quantity' },
                  { value: 'ENUMERATION', label: 'Enumeration' },
                ]}
              />
            </Form.Item>
          </Space>
          <DataTypeSubForm type={type} />
        </Form>
      </Modal>
    </>
  );
};
