import React, { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Form, Select } from 'antd';
import { DataTypeNumerical } from './DataTypeNumerical';
import { getAll } from '../../Manager/FetchManager';

function DataTypeSubForm({ form, type }) {
  const { vocabUrl } = useContext(myContext);
  const [terminologies, setTerminologies] = useState([]);

  useEffect(() => {
    type === 'ENUMERATION' &&
      getAll(vocabUrl, 'Terminology').then(data => setTerminologies(data));
  }, [type]);

  return (
    <>
      {type === 'INTEGER' || type === 'QUANTITY' ? (
        <DataTypeNumerical form={form} />
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
