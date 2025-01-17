import {
  Button,
  Form,
  Input,
  message,
  Modal,
  notification,
  Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useContext, useState } from 'react';
import { ModalSpinner } from '../../Manager/Spinner';
import { myContext } from '../../../App';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { RequiredLogin } from '../../Auth/RequiredLogin';

export const AddTerminology = () => {
  const handleSuccess = () => {
    setCreateTerm(true);
  };
  const login = RequiredLogin({ handleSuccess: handleSuccess });
  const [form] = Form.useForm();
  const { vocabUrl, user } = useContext(myContext);

  const [createTerm, setCreateTerm] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const termUpload = values => {
    const cleanedCodes = values.codes.map(item => ({
      ...item,
      code: item.code.toLowerCase().replaceAll(' ', '_'),
    }));

    setLoading(true);
    fetch(`${vocabUrl}/Terminology`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...values,
        codes: cleanedCodes,
      }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(error => {
            throw new Error(error.message_to_user || 'An error occurred');
          });
        }
        return res.json();
      })
      .then(data => {
        setCreateTerm(false);
        form.resetFields();
        message.success('Terminology uploaded successfully.');
        navigate(`/Terminology/${data.id}`);
      })
      .catch(error => {
        notification.error({
          message: 'Error',
          description: 'An error occurred uploading the terminology',
        });
      })
      .finally(() => setLoading(false));
  };

  /* Function for upload. If a file was uploaded, it takes the values from the form, parses the uploaded file's content
  into JSON, gets the file name to display on the page later, creates a "codes" array 
  with the file's data, then runs the termUpload function to create the new table.
  If there is no file selected, it skips the JSON parsing and skips straight to the POST. */
  const handleUpload = values => {
    values?.codes?.file
      ? Papa.parse(values.codes.file, {
          header: true,
          skipEmptyLines: true,
          complete: function (result) {
            values.codes = result.data;
            termUpload(values);
          },
        })
      : termUpload({
          ...values,
          codes: [],
        });
  };

  return (
    <>
      <div className="add_row_buttons">
        <Button
          onClick={() => {
            if (user) {
              setCreateTerm(true);
            } else {
              login();
            }
          }}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          Create Terminology
        </Button>
      </div>
      <Modal
        open={createTerm}
        width={'70%'}
        onOk={() => {
          form.validateFields().then(values => {
            handleUpload(values);
          });
        }}
        onCancel={() => {
          form.resetFields();
          setFileList([]);
          setCreateTerm(false);
        }}
        maskClosable={false}
        cancelButtonProps={{ disabled: loading }}
        okButtonProps={{ disabled: loading }}
        closeIcon={false}
      >
        {loading ? (
          <ModalSpinner />
        ) : (
          <Form form={form} layout="vertical" name="form_in_modal">
            <h2>Create Terminology</h2>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: 'Please input Terminology name.' },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="url"
              label="System"
              rules={[
                { required: true, message: 'Please input Terminology system.' },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="codes"
              extra="CSV files only in Data Dictionary format."
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
