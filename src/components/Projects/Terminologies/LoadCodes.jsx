import { Button, Form, Upload, Modal, notification, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { ModalSpinner } from '../../Manager/Spinner';

export const LoadCodes = ({ terminology, setTerminology }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const { vocabUrl, importState, setImportState, user } = useContext(myContext);
  const [loading, setLoading] = useState(false);

  const termUpload = values => {
    const cleanedCodes = values.codes.map(item => ({
      ...item,
      code: item.code.toLowerCase().replaceAll(' ', '_'),
    }));

    console.log({
      ...values,
      codes: cleanedCodes,
      name: terminology.name,
      description: terminology.description,
      url: terminology.url,
    });

    setLoading(true);
    fetch(`${vocabUrl}/Terminology/${terminology.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...values,
        codes: cleanedCodes,
        name: terminology.name,
        description: terminology.description,
        url: terminology.url,
      }),
    })
      .then(res => {
        if (res.status === 400) {
          return res.json().then(error => {
            notification.error({
              message: 'Error',
              description: `${error.message_to_user}`,
              duration: 10,
            });
            throw new Error('400 error');
          });
        } else if (!res.ok) {
          return res.json().then(error => {
            throw new Error(error.message_to_user || 'An error occurred');
          });
        }
        return res.json();
      })
      .then(updatedData => {
        setImportState(false);
        setTerminology(updatedData);
        message.success('Codes uploaded successfully.');
      })
      .catch(error => {
        if (error.message !== '400 error') {
          notification.error({
            message: 'Error',
            description: 'An error occurred uploading the codes',
          });
        }
      })
      .finally(() => setLoading(false));
  };

  /* Function for upload. If a file was uploaded, it takes the values from the form, parses the uploaded file's content
  into JSON, gets the file name to display on the page later, creates a "codes" array 
  with the file's data, then runs the termUpload function to create the new table.
  If there is no file selected, it skips the JSON parsing and skips straight to the POST. */
  const handleUpload = values => {
    Papa.parse(values.codes.file, {
      header: true,
      skipEmptyLines: true,
      complete: function (result) {
        values.codes = result.data;
        termUpload(values);
      },
    });
  };

  return (
    <>
      {/* when the OK button is pressed, the form validates the fields to ensure required sections are completed.
          The handleSubmit function is called to POST the values to the API. 
          The modal is reset to its initial, blank state.
          load is set to false to close the modal */}
      <Modal
        open={importState}
        width={'50%'}
        onOk={() =>
          form.validateFields().then(values => {
            handleUpload(values);
            form.resetFields();
          })
        }
        onCancel={() => {
          form.resetFields();
          setImportState(false);
          setFileList([]);
        }}
        cancelButtonProps={{ disabled: loading }}
        okButtonProps={{ disabled: loading }}
        maskClosable={false}
      >
        {loading ? (
          <ModalSpinner />
        ) : (
          <Form form={form} layout="vertical" name="form_in_modal">
            <h2>Upload Codes</h2>
            <Form.Item
              name="codes"
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
        )}
      </Modal>
    </>
  );
};
