import React, { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Form, Select } from 'antd';
import { DataTypeNumerical } from './DataTypeNumerical';
import { getAll } from '../../Manager/FetchManager';
import { useNavigate } from 'react-router-dom';

function DataTypeSubForm({ form, type }) {
  const { vocabUrl } = useContext(myContext);
  const [terminologies, setTerminologies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    type === 'ENUMERATION' &&
      getAll(vocabUrl, 'Terminology', navigate).then(data =>
        setTerminologies(data)
      );
  }, [type]);

  return (
    <>
      {type === 'INTEGER' || type === 'QUANTITY' ? (
        <DataTypeNumerical form={form} type={type} />
      ) : (
        type === 'ENUMERATION' && (
          <Form.Item label="Terminology" name={['enumerations', 'reference']}>
            <Select
              showSearch
              style={{
                width: '50%',
              }}
              placeholder="Search to Select"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').includes(input)
              }
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '')
                  .toLowerCase()
                  .localeCompare((optionB?.label ?? '').toLowerCase())
              }
              options={terminologies.map(term => {
                return {
                  value: `Terminology/${term?.id}`,
                  label: term?.name,
                };
              })}
            />
          </Form.Item>
        )
      )}
    </>
  );
}

export default DataTypeSubForm;
