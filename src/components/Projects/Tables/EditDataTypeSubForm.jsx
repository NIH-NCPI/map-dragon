import React, { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Form, Select } from 'antd';
import { getAll } from '../../Manager/FetchManager';
import { EditDataTypeNumerical } from './EditDataTypeNumerical';

function EditDataTypeSubForm({ type, form, editRow, tableData, setType }) {
  const { vocabUrl } = useContext(myContext);
  const [terminologies, setTerminologies] = useState([]);

  useEffect(() => {
    type === 'ENUMERATION' &&
      getAll(vocabUrl, 'Terminology').then(data => setTerminologies(data));
  }, [type]);

  useEffect(() => {
    if (editRow === tableData.key && type === 'ENUMERATION') {
      form.setFieldsValue({
        enumerations: {
          reference: tableData.enumeration.props.to.slice(1),
        },
      });

      console.log(tableData.enumeration.props.to.slice(1));
    }
  }, [editRow, tableData, form]);

  // console.log(tableData);
  return (
    <>
      {type === 'INTEGER' || type === 'QUANTITY' ? (
        <EditDataTypeNumerical />
      ) : (
        type === 'ENUMERATION' && (
          <Form.Item label="Terminology" name={['enumerations', 'reference']}>
            <Select
              value={form.getFieldValue(['enumerations', 'reference'])}
              onChange={() =>
                console.log(form.getFieldValue(['enumerations', 'reference']))
              }
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

export default EditDataTypeSubForm;
