import { Button, Form, Input, Modal } from 'antd';

export const AddTerminology = () => {
  const [form] = Form.useForm();

  const { TextArea } = Input;

  return (
    <>
      <div className="add_row_button">
        <Button
          //   onClick={() => setAddRow(true)}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          Create Terminology
        </Button>
      </div>
      <Modal
        // open={addRow}
        width={'70%'}
        onOk={() => {
          form.validateFields().then(values => {
            // handleSubmit(values);
          });
        }}
        onCancel={() => {
          form.resetFields();
        }}
        maskClosable={false}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name={['name']}
            label="Variable name"
            rules={[{ required: true, message: 'Input variable name.' }]}
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
        </Form>
      </Modal>
    </>
  );
};
