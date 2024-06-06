import { useContext, useRef, useState } from 'react';
import { myContext } from '../../../App';
import { Button, Form, Input, message, Select, Space, Tooltip } from 'antd';
import { CloseOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { handleUpdate } from '../../Manager/FetchManager';
import DataTypeSubForm from './DataTypeSubForm';

export const AddVariable = ({
  table,
  setTable,
  dataSource,
  setDataSource,
  form,
}) => {
  const { vocabUrl } = useContext(myContext);
  const [addRow, setAddRow] = useState(false);
  const [type, setType] = useState('');
  const { TextArea } = Input;

  // allVars set to the terminology codes array. Then the refs from the code and display
  // input fields are pushed to the allVars array to be attached to the body of the PUT request.
  //   const newRowDTO = () => {
  //     return {
  //       name: newVarRef.current.input.defaultValue,
  //       description: newDescRef.current.input.defaultValue,
  //       data_type: type,
  //     };
  // let allVars = table.variables;
  // allVars.push({
  //   name: newVarRef.current.input.defaultValue,
  //   description: newDescRef.current.input.defaultValue,
  // });
  // return allVars;
  //   };

  // Takes the newRowDTO function above and adds it to the body of the PUT request to add new codes to the codes array

  const saveNewRow = values => {
    console.log(values);
    table.variables.some(
      item => item.name.toLowerCase() === values.name.toLowerCase()
    )
      ? message.error(
          `"${values.name}" already exists in the Table. Please choose a different name.`
        )
      : fetch(`${vocabUrl}/Table/${table.id}/variable/${values.name}}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })
          .then(res => {
            if (res.ok) {
              return res.json();
            } else {
              throw new Error('An unknown error occurred.');
            }
          })
          .then(data => setTable(data))
          .then(() => setAddRow(false))
          // Displays a self-closing message that the udpates have been successfully saved.
          .then(() => message.success('Variable added successfully.'));
  };

  const rowButtons = () => {
    return (
      <>
        <span className="add_row_buttons">
          <Tooltip title="Cancel">
            <Button
              shape="circle"
              size="small"
              icon={<CloseOutlined />}
              className="actions_icon"
              onClick={handleCancel}
            />
          </Tooltip>
          <Tooltip title="Save">
            <Button
              shape="circle"
              size="small"
              icon={<CloudUploadOutlined />}
              className="actions_icon"
              htmlType="submit"
            />
          </Tooltip>
        </span>
      </>
    );
  };

  // Sets the data source for the table to input fields with respective refs.
  // A save button in the end that calls the saveNewRow PUT request function on click.
  const handleAdd = () => {
    setAddRow(true);
    setDataSource([
      {
        key: 'newRow',
        name: (
          <Form.Item
            name={['name']}
            rules={[{ required: true, message: 'Input variable name' }]}
          >
            <Input
              style={{
                width: '6.5vw',
              }}
              autoFocus
            />
          </Form.Item>
        ),
        description: (
          <Form.Item
            name={['description']}
            rules={[{ required: true, message: 'Input variable description' }]}
          >
            <TextArea
              rows={1}
              style={{
                width: '13.6vw',
              }}
            />
          </Form.Item>
        ),
        data_type: (
          <Form.Item
            name={['data_type']}
            rules={[{ required: true, message: 'Select data type.' }]}
          >
            <Select
              style={{ width: '7.5vw' }}
              placeholder="Data type"
              onChange={value => {
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
        ),
        get_mappings: rowButtons(),
        // delete_column: '',
      },

      ...dataSource,
    ]);
  };

  const handleCancel = () => {
    setDataSource(dataSource);
    setAddRow(false);
  };

  return (
    <div className="add_row_button">
      <Form form={form} onFinish={saveNewRow}>
        <Space
          style={{
            display: 'flex',
            marginBottom: 3,
          }}
          align="baseline"
        >
          <Button
            onClick={handleAdd}
            type="primary"
            style={{
              marginBottom: 16,
            }}
            disabled={addRow}
          >
            Add variable
          </Button>
          <DataTypeSubForm type={type} />
        </Space>
      </Form>
    </div>
  );
};
