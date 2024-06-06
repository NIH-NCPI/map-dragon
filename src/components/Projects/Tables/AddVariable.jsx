import { useContext, useRef, useState } from 'react';
import { myContext } from '../../../App';
import { Button, Form, Input, message, Select, Space, Tooltip } from 'antd';
import { CloseOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { handleUpdate } from '../../Manager/FetchManager';

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

  const newVarRef = useRef();
  const newDescRef = useRef();

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

  // newVarRef.current.input.defaultValue === '' ||
  // newDescRef.current.input.defaultValue === ''
  //   ? message.error('Please fill out the name and description.')
  //   : table.variables.some(
  //       item =>
  //         item.name.toLowerCase() ===
  //         newVarRef.current.input.defaultValue.toLowerCase()
  //     )
  //   ? message.error(
  //       `"${newVarRef.current.input.defaultValue}" already exists in the Terminology. Please choose a different name.`
  //     )
  //   : handleUpdate(vocabUrl, 'Table', table, {
  //       ...table,
  //       variables: newRowDTO(),
  //     })
  //       .then(data => setTable(data))
  //       .then(() => setAddRow(false))
  //       // Displays a self-closing message that the udpates have been successfully saved.
  //       .then(() => message.success('Variable added successfully.'));
  const saveNewRow = values => {
    console.log(values);
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

  const handleChange = value => setType(value);

  // Sets the data source for the table to input fields with respective refs.
  // A save button in the end that calls the saveNewRow PUT request function on click.
  const handleAdd = () => {
    setAddRow(true);
    setDataSource([
      {
        key: 'newRow',
        name: (
          <Form.Item
            name={['newRow', 'name']}
            rules={[{ required: true, message: 'Input variable name' }]}
          >
            <Input />
          </Form.Item>
        ),
        description: (
          <Form.Item
            name={['newRow', 'description']}
            rules={[{ required: true, message: 'Input variable description' }]}
          >
            <Input />
          </Form.Item>
        ),
        data_type: (
          <Form.Item
            name={['newRow', 'data_type']}
            rules={[{ required: true, message: 'Select data type.' }]}
          >
            <Select
              style={{ width: '10vw' }}
              placeholder="Select data type"
              onChange={handleChange}
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
        </Space>
      </Form>
    </div>
  );
};
