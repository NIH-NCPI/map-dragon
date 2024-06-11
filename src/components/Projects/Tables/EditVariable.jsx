import {
  Button,
  Form,
  Input,
  message,
  Modal,
  notification,
  Select,
  Space,
  Tooltip,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Spinner } from '../../Manager/Spinner';
import { getById, handlePatch } from '../../Manager/FetchManager';
import { useParams } from 'react-router-dom';
import { MappingContext } from '../../../MappingContext';
import { DeleteVariable } from './DeleteVariable';
import EditDataTypeSubForm from './EditDataTypeSubForm';

export const EditVariable = ({
  editRow,
  setEditRow,
  tableData,
  table,
  setTable,
  dataSource,
  setDataSource,
  form,
  loading,
  setLoading,
}) => {
  const { TextArea } = Input;
  const { vocabUrl } = useContext(myContext);
  const { setMapping } = useContext(MappingContext);
  const { tableId } = useParams();
  const [type, setType] = useState('');

  /* Submit function to edit a row. The input field is validated to ensure it is not empty.
     The index of the row being edited is found by the key of the row in the dataSource. 
     The element at that index is set to the index variable. If the index exists, item is set to 
     the element at that index. The data at the index of the row is replaced with the newData. 
      */

  // useEffect(() => {
  //   if (editRow !== null && dataSource[editRow]) {
  //     const { name, description } = dataSource[editRow];
  //     form.setFieldsValue({ name, description });
  //   }
  // }, [editRow]);

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
        item.name.toLowerCase() === value.toLowerCase() &&
        value.toLowerCase() !== tableData.name.toLowerCase()
    );

    if (isUnique) {
      return Promise.resolve();
    } else {
      return Promise.reject(
        new Error(`"${value}" already exists. Please choose a different name.`)
      );
    }
  };
  const handleSubmit = values => {
    console.log(values);
    // const row = await form.validateFields();
    // const index = dataSource.findIndex(item => key === item.key);
    // const newData = [...dataSource];
    // if (index > -1) {
    //   const item = newData[index];
    //   newData.splice(index, 1, {
    //     ...item,
    //     ...row,
    //   });
    // }

    // // Object to put in the body of the PATCH request. Provides the old variable
    // // and replaces with the updated variable and/or description on the back end.
    // // The variable in the associdated mappings is automatically udpated on the back end.
    // const updatedRowDTO = {
    //   variable: {
    //     [`${dataSource[index].name}`]: `${row.name}`,
    //   },
    //   description: {
    //     [dataSource[index].name]: row.description,
    //   },
    // };

    // if (
    //   table.variables.some(
    //     item =>
    //       item.name.toLowerCase() === row.name.toLowerCase() &&
    //       dataSource[index].name.toLowerCase() !== row.name.toLowerCase()
    //   )
    // ) {
    //   message.error(
    //     `"${row.name}" already exists. Please choose a different name.`
    //   );
    // } else {
    //   setLoading(true);
    //   handlePatch(vocabUrl, 'Table', table, updatedRowDTO)
    //     .then(data => {
    //       setTable(data);
    //       setDataSource(newData);
    //       setEditRow('');
    //       message.success('Changes saved successfully.');
    //     })
    //     .catch(error => {
    //       if (error) {
    //         notification.error({
    //           message: 'Error',
    //           description:
    //             'An error occurred updating the row. Please try again.',
    //         });
    //       }
    //       return error;
    //     })
    //     .then(() =>
    //       getById(vocabUrl, 'Table', `${tableId}/mapping`)
    //         .then(data => setMapping(data.codes))
    //         .catch(error => {
    //           if (error) {
    //             notification.error({
    //               message: 'Error',
    //               description:
    //                 'An error occurred loading mappings. Please try again.',
    //             });
    //           }
    //           return error;
    //         })
    //     )
    //     .finally(() => setLoading(false));
    // }
  };

  return (
    <>
      {!loading ? (
        editRow !== tableData.key ? (
          /* if the row is not being edited, the edit and delete icons are displayed*/
          <>
            <Tooltip title="Edit">
              {' '}
              <Button
                shape="circle"
                size="small"
                icon={<EditOutlined />}
                className="actions_icon"
                onClick={() => {
                  /* editRow is set to the key of the of the row.*/
                  setEditRow(tableData.key);
                }}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <DeleteVariable
                tableData={tableData}
                table={table}
                setTable={setTable}
              />{' '}
            </Tooltip>
          </>
        ) : (
          //if the row is being edited, the cancel and save icons are displayed
          <>
            <Modal
              open={editRow === tableData.key}
              width={'70%'}
              onOk={() => {
                form.validateFields().then(values => {
                  handleSubmit(values);
                  form.resetFields();
                  setEditRow('');
                  setType('');
                });
              }}
              onCancel={() => {
                form.resetFields();
                setEditRow('');
                setType('');
              }}
              maskClosable={false}
              destroyOnClose={true}
            >
              {' '}
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
                      autoFocus
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
                  type={type}
                  setType={setType}
                  form={form}
                  editRow={editRow}
                  tableData={tableData}
                />
              </Form>
            </Modal>
          </>
        )
      ) : (
        <Spinner />
      )}
    </>
  );
};
