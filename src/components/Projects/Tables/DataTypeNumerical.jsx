import { Form, Input, Space } from 'antd';

export const DataTypeNumerical = () => {
  return (
    <>
      <Space
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}
      >
        <Form.Item
          style={{
            flex: 1,
          }}
          label="Min"
          name={[name, 'min']}
          rules={[
            {
              required: true,
              message: 'Min value is required.',
            },
          ]}
        >
          <Input
            style={{
              width: '15vw',
            }}
            placeholder="Min"
            autoFocus
          />
        </Form.Item>
        <Form.Item
          label="Max"
          name={[name, 'max']}
          rules={[
            {
              required: true,
              message: 'Max value is required.',
            },
          ]}
        >
          <Input
            style={{
              width: '15vw',
            }}
            placeholder="Max"
          />
        </Form.Item>
        <Form.Item
          label="Units"
          name={[name, 'units']}
          rules={[
            {
              required: true,
              message: 'Units are required.',
            },
          ]}
        >
          <Input
            style={{
              width: '15vw',
            }}
            placeholder="Units"
          />
        </Form.Item>
      </Space>
    </>
  );
};
