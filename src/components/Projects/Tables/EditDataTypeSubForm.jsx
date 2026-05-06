import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Form, Select, Spin } from 'antd';
import { getAll } from '../../Manager/FetchManager';
import { EditDataTypeNumerical } from './EditDataTypeNumerical';
import '../../Manager/Spinner.scss';
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
          reference: tableData?.variable?.enumerations?.reference
        }
      });
    }
  };

  return (
    <>
      {type === 'INTEGER' || type === 'QUANTITY' ? (
        <EditDataTypeNumerical type={type} form={form} tableData={tableData} />
      ) : (
        type === 'ENUMERATION' && (
          <>
            {terminologyLoading && (
              <div className="loading_overlay_modal">
                <Spin />
              </div>
            )}
            <Form.Item label="Terminology" name={['enumerations', 'reference']}>
              <Select
                value={form.getFieldValue(['enumerations', 'reference'])}
                onChange={value => {
                  form.setFieldsValue({ enumerations: { reference: value } });
                }}
                showSearch
                style={{
                  width: '50%'
                }}
                placeholder="Search to Select"
                optionFilterProp="children"
                // Searches by terminology name, accounting for spaces in the name
                filterOption={(input, option) => {
                  const trimmedInput = input.toLowerCase().trim();
                  const optionLabel = (option?.label).toLowerCase().trim();
                  return optionLabel.includes(trimmedInput);
                }}
                filterSort={(optionA, optionB) =>
                  (optionA?.label)
                    .toLowerCase()
                    .localeCompare((optionB?.label).toLowerCase())
                }
                options={terminologies.map(term => {
                  return {
                    value: `Terminology/${term?.id}`,
                    label: term?.name
                  };
                })}
              />
            </Form.Item>
          </>
        )
      )}
    </>
  );
}

export default EditDataTypeSubForm;
