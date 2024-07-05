import React, { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Form, Select } from 'antd';
import { getAll } from '../../Manager/FetchManager';
import { EditDataTypeNumerical } from './EditDataTypeNumerical';
import { ModalSpinner } from '../../Manager/Spinner';
import { useNavigate } from 'react-router-dom';

function EditDataTypeSubForm({ type, form, editRow, tableData }) {
  const { vocabUrl } = useContext(myContext);
  const [terminologies, setTerminologies] = useState([]);
  const [terminologyLoading, setTerminologyLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (type) {
      if (type === 'ENUMERATION') {
        setTerminologyLoading(true);
        getAll(vocabUrl, 'Terminology', navigate)
          .then(data => setTerminologies(data))
          .then(() => {
            setEnumFieldValue();
          })
          .then(() => {
            setTerminologyLoading(false);
          });
      }
    }
  }, [type]);

  const setEnumFieldValue = () => {
    if (editRow === tableData.key && tableData.data_type === 'ENUMERATION') {
      form.setFieldsValue({
        enumerations: {
          reference: tableData.enumeration.props.to.slice(1),
        },
      });
    }
  };

  return (
    <>
      {type === 'INTEGER' || type === 'QUANTITY' ? (
        <EditDataTypeNumerical type={type} form={form} />
      ) : (
        type === 'ENUMERATION' &&
        (!terminologyLoading ? (
          <Form.Item label="Terminology" name={['enumerations', 'reference']}>
            <Select
              value={form.getFieldValue(['enumerations', 'reference'])}
              onChange={value => {
                form.setFieldsValue({ enumerations: { reference: value } });
              }}
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
        ) : (
          <ModalSpinner />
        ))
      )}
    </>
  );
}

export default EditDataTypeSubForm;
