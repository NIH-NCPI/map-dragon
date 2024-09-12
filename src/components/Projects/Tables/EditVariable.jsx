import { Form, Input, message, Modal, notification, Select, Space } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { ModalSpinner } from '../../Manager/Spinner';
import { getById, handlePatch } from '../../Manager/FetchManager';
import { useParams } from 'react-router-dom';
import { MappingContext } from '../../../MappingContext';
import EditDataTypeSubForm from './EditDataTypeSubForm';

export const EditVariable = ({
  editRow,
  setEditRow,
  tableData,
  table,
  setTable,
  form,
  setSelectedKey,
}) => {
  const { TextArea } = Input;
  const { vocabUrl, user } = useContext(myContext);
  const { setMapping } = useContext(MappingContext);
  const { tableId } = useParams();
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editRow === tableData.key) {
      form.setFieldsValue({
        name: tableData.name,
        description: tableData.description,
        data_type: tableData.data_type,
        min: tableData?.min,
        max: tableData?.max,
        units: tableData?.units,
        enumerations: { reference: tableData?.enumerations?.reference },
      });
      setType(tableData.data_type);
    }
  }, [editRow, tableData, form, setType]);

  const validateUnique = (_, value) => {
    // Validator function for form. Checks if the term being added already exists.
    const isUnique = !table.variables.some(
      item =>
        item.name?.toLowerCase() === value?.toLowerCase() &&
        value?.toLowerCase() !== tableData?.name?.toLowerCase()
    );

    if (isUnique) {
      return Promise.resolve();
    } else {
      return Promise.reject(
        new Error(`"${value}" already exists. Please choose a different name.`)
      );
    }
  };

  const handleSubmit = async values => {
    // // Object to put in the body of the PATCH request. Provides the old variable
    // // and replaces with the updated variable on the back end.
    // // The variable in the associated mappings is automatically udpated on the back end.
    setLoading(true);
    const updatedName = {
      variable: {
        [`${tableData.name}`]: `${values.name}`,
      },
    };

    // If there is a change in the variable name, the name is first sent to the 'rename' endpoint
    // with a PATCH request to update the name and the code name for the associated mappings.
    // All the values from the form are then sent for editing with a PUT request.
    // Else if there is not a change in the name, all the form values are  sent to the variable.name
    // endpoint with a PUT request to edit the data for the variable.
    if (!table.variables.some(item => item?.name === values?.name)) {
      handlePatch(vocabUrl, 'Table', table, {
        ...updatedName,
        editor: user.email,
      })
        .catch(error => {
          if (error) {
            notification.error({
              message: 'Error',
              description: 'An error occurred updating the name.',
            });
          }
          return error;
        })
        .then(() => {
          fetch(`${vocabUrl}/Table/${table.id}/variable/${values.name}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...values, editor: user.email }),
          })
            .then(res => {
              if (res.ok) {
                return res.json();
              } else {
                throw new Error('An unknown error occurred.');
              }
            })
            .then(data => {
              setTable(data);
              form.resetFields();
              setEditRow('');
              message.success('Changes saved successfully.');
            });
        })
        .then(() =>
          getById(vocabUrl, 'Table', `${tableId}/mapping`)
            .then(data => setMapping(data.codes))
            .catch(error => {
              if (error) {
                notification.error({
                  message: 'Error',
                  description:
                    'An error occurred loading mappings. Please try again.',
                });
              }
              return error;
            })
            .finally(() => setLoading(false))
        );
    } else {
      setLoading(true);
      fetch(`${vocabUrl}/Table/${table.id}/variable/${values.name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...values, editor: user.email }),
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error('An unknown error occurred.');
          }
        })
        .then(data => {
          setTable(data);
          form.resetFields();
          setEditRow('');
          message.success('Changes saved successfully.');
        })

        .then(() =>
          getById(vocabUrl, 'Table', `${tableId}/mapping`)
            .then(data => setMapping(data.codes))
            .catch(error => {
              if (error) {
                notification.error({
                  message: 'Error',
                  description:
                    'An error occurred loading mappings. Please try again.',
                });
              }
              return error;
            })
            .finally(() => setLoading(false))
        );
    }
  };

  return (
    <>
      {editRow === tableData.key && (
        <Modal
          open={editRow === tableData.key}
          width={'70%'}
          onOk={() => {
            form.validateFields().then(values => {
              handleSubmit(values);
              setType('');
              setSelectedKey(null);
            });
          }}
          onCancel={() => {
            form.resetFields();
            setEditRow(null);
            setType('');
            setSelectedKey(null);
          }}
          maskClosable={false}
          destroyOnClose={true}
          cancelButtonProps={{ disabled: loading }}
          okButtonProps={{ disabled: loading }}
        >
          {loading ? (
            <ModalSpinner />
          ) : (
            <Form form={form} layout="vertical" preserve={false}>
              <Space
                style={{
                  display: 'flex',
                  marginBottom: 3,
                }}
                align="baseline"
              >
                <Form.Item
                  name={['name']}
                  label="Variable name"
                  rules={[
                    { required: true, message: 'Variable name is required.' },
                    { validator: validateUnique },
                  ]}
                >
                  <TextArea
                    autoSize={true}
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
                      message: 'Variable description is required.',
                    },
                  ]}
                >
                  <TextArea
                    autoSize={true}
                    style={{
                      width: '39vw',
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="Data Type"
                  name={['data_type']}
                  rules={[
                    {
                      required: true,
                      message: 'Select data type.',
                    },
                  ]}
                >
                  <Select
                    value={form.getFieldValue('data_type')}
                    style={{ width: '10vw' }}
                    placeholder="Select data type"
                    onChange={value => {
                      form.setFieldsValue({ data_type: value });
                      setType(value);
                    }}
                    options={[
                      { value: 'STRING', label: 'String' },
                      { value: 'INTEGER', label: 'Integer' },
                      { value: 'QUANTITY', label: 'Quantity' },
                      { value: 'ENUMERATION', label: 'Enumeration' },
                    ]}
                  />
                </Form.Item>
              </Space>
              <EditDataTypeSubForm
                setLoading={setLoading}
                type={type}
                setType={setType}
                form={form}
                editRow={editRow}
                tableData={tableData}
              />
            </Form>
          )}
        </Modal>
      )}
    </>
  );
};
