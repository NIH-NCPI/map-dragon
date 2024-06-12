import { Form, Input, Space } from 'antd';

export const DataTypeNumerical = ({ form }) => {
  const validateMin = () => {
    // Validator function for form. Checks if the term being added already exists.
    const min = form.getFieldValue('min');
    const max = form.getFieldValue('max');

    if (min !== undefined && max !== undefined && min >= max) {
      return Promise.reject(
        new Error('Min value must be less than max value.')
      );
    }
    return Promise.resolve();
  };

  // const validateNumber = ()

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
          preserve={false}
          style={{
            flex: 1,
          }}
          label="Min"
          name={['min']}
          rules={[
            { validator: validateMin },
            // {
            //   required: true,
            //   message: 'Min value is required.',
            // },
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
          preserve={false}
          label="Max"
          name={['max']}
          rules={[
            { validator: validateMin },

            // {
            //   required: true,
            //   message: 'Max value is required.',
            // },
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
          preserve={false}
          label="Units"
          name={['units']}
          // rules={[
          //   {
          //     required: true,
          //     message: 'Units are required.',
          //   },
          // ]}
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
