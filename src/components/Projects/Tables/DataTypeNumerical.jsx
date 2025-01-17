import { Form, Input, InputNumber, Select, Space } from 'antd';
import { getById } from '../../Manager/FetchManager';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';

export const DataTypeNumerical = ({ form, type }) => {
  const { ucumCodes } = useContext(myContext);

  const options = ucumCodes.map((uc, i) => {
    return {
      key: i,
      value: `ucum:${uc.code}`,
      label: uc.display,
    };
  });

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

  // If the type is not an integer, the input field will allow up to 10 decimal places
  // and will not display the trailing zeros.
  const formatter = value => {
    if (type !== 'INTEGER' && typeof value === 'number' && !isNaN(value)) {
      return value.toFixed(10).replace(/\.?0+$/, '');
    }
    return value;
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
          name="min"
          rules={[{ validator: validateMinMax }]}
        >
          <InputNumber
            style={{
              width: '15vw',
            }}
            placeholder="Min"
            autoFocus
            onChange={handleFieldChange}
            precision={type === 'INTEGER' ? 0 : 10}
            formatter={formatter}
          />
        </Form.Item>
        <Form.Item
          preserve={false}
          label="Max"
          name="max"
          rules={[{ validator: validateMinMax }]}
        >
          <InputNumber
            style={{
              width: '15vw',
            }}
            placeholder="Max"
            onChange={handleFieldChange}
            precision={type === 'INTEGER' ? 0 : 10}
            formatter={formatter}
          />
        </Form.Item>
        <Form.Item preserve={false} label="Units" name="units">
          <Select
            showSearch
            style={{
              width: '100%',
            }}
            placeholder="Select UCUM units"
            optionFilterProp="children"
            popupMatchSelectWidth={false}
            filterOption={(input, option) => {
              const labelMatch = (option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase());
              const valueMatch = (option?.value ?? '')
                .toLowerCase()
                .includes(input.toLowerCase());
              return valueMatch || labelMatch;
            }}
            options={options}
          />
        </Form.Item>
      </Space>
    </>
  );
};
