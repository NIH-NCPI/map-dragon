import { Button, Form, Upload, Modal, notification, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import './TableStyling.scss';
import { handlePost, handleUpdate } from '../../Manager/FetchManager';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { useNavigate, useParams } from 'react-router-dom';

export const LoadVariables = ({ load, setLoad }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const { vocabUrl, setTable, table } = useContext(myContext);

  const tableUpload = values => {
    handleUpdate(vocabUrl, 'LoadTable', table, values)
      .then(updatedData => {
        setTable(updatedData);
        message.success('Variables uploaded successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred updating the data dictionary. Please try again.',
          });
        }
        return error;
      });
  };

  /* Function for upload. If a file was uploaded, it takes the values from the form, parses the uploaded file's content
    into JSON, gets the file name to display on the page later, creates a "csvContents" array 
    with the file's data, then runs the tableUpload function to create the new table. */
  const handleUpload = values => {
    Papa.parse(values.csvContents.file, {
      header: true,
      skipEmptyLines: true,
      complete: function (result) {
        values.filename = values.csvContents.file.name;
        values.csvContents = result.data;
        tableUpload(values);
      },
    });
  };
  return (
    <>
      {/* ant.design modal with the form to add a table */}
      {/* when the OK button is pressed, the form validates the fields to ensure required sections are completed.
          The handleSubmit function is called to POST the values to the API. 
          The modal is reset to its initial, blank state.
          load is set to false to close the modal */}
      <Modal
        open={load}
        width={'70%'}
        onOk={() =>
          form.validateFields().then(values => {
            handleUpload(values);
            form.resetFields();
            setLoad(false);
          })
        }
        onCancel={() => {
          form.resetFields();
          setLoad(false);
          setFileList([]);
        }}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" name="form_in_modal">
          <h2>Upload Variables</h2>
          <Form.Item
            name="csvContents"
            rules={[{ required: true, message: 'Please select file.' }]}
            extra="CSV files only, in Data Dictionary format."
          >
            <Upload
              maxCount={1}
              onRemove={file => {
                const index = fileList.indexOf(file);
                const newFileList = fileList.slice();
                newFileList.splice(index, 1);
                setFileList(newFileList);
              }}
              beforeUpload={file => {
                setFileList([...fileList, file]);
                return false;
              }}
              accept=".csv"
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
