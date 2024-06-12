import { Form, Input, Space } from 'antd';

export const EditDataTypeNumerical = ({ form }) => {
  // Validation function to ensure values are numbers and min is less than max
  const validateMinMax = () => {
    const min = parseFloat(form.getFieldValue('min'));
    const max = parseFloat(form.getFieldValue('max'));

    if (!isNaN(min) && !isNaN(max) && min >= max) {
      return Promise.reject(
        new Error('Min value must be less than max value.')
      );
    }
    return Promise.resolve();
  };

  // Validates fields when the values change
  const handleFieldChange = () => {
    form.validateFields(['min', 'max']);
  };
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
            {
              validator: validateMinMax,
            },
          ]}
        >
          <Input
            type="number"
            style={{
              width: '15vw',
            }}
            placeholder="Min"
            autoFocus
            onChange={handleFieldChange}
          />
        </Form.Item>
        <Form.Item
          preserve={false}
          label="Max"
          name={['max']}
          rules={[
            {
              validator: validateMinMax,
            },
          ]}
        >
          <Input
            type="number"
            style={{
              width: '15vw',
            }}
            placeholder="Max"
            onChange={handleFieldChange}
          />
        </Form.Item>
        <Form.Item preserve={false} label="Units" name={['units']}>
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
