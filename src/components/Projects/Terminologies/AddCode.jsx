import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  notification,
  Select,
  Space,
} from 'antd';
import { ModalSpinner } from '../../Manager/Spinner';
import { RequiredLogin } from '../../Auth/RequiredLogin';
import { uriEncoded } from '../../Manager/Utility';

export const AddCode = ({ terminology, setTerminology }) => {
  const { vocabUrl, user } = useContext(myContext);
  const [addRow, setAddRow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { TextArea } = Input;
  const [form] = Form.useForm();

  const handleSuccess = () => {
    setAddRow(true);
  };
  const login = RequiredLogin({ handleSuccess: handleSuccess });

  const handleSubmit = values => {
    setLoading(true);
    fetch(
      `${vocabUrl}/Terminology/${terminology.id}/code/${uriEncoded(
        values.code
      )}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...values, editor: user.email }),
      }
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => {
        setTerminology(data);
        form.resetFields();
        setAddRow(false);
      })
      // Displays a self-closing message that the udpates have been successfully saved.
      .then(() => message.success('Code added successfully.'))
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred adding the code.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  };

  const validateUnique = (_, value) => {
    // Validator function for form. Checks if the term being added already exists.
    const isUnique = !terminology.codes.some(
      item => item?.code?.toLowerCase() === value?.toLowerCase()
    );

    if (isUnique) {
      return Promise.resolve();
    } else {
      return Promise.reject(
        new Error(`"${value}" already exists. Please choose a different name.`)
      );
    }
  };

  return (
    <>
      <div className="add_row_button">
        <Button
          onClick={() => (user ? setAddRow(true) : login())}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          Add code
        </Button>
      </div>
      <Modal
        open={addRow}
        width={'60%'}
        onOk={() =>
          form.validateFields().then(values => {
            handleSubmit(values);
          })
        }
        onCancel={() => {
          form.resetFields();
          setAddRow(false);
        }}
        maskClosable={false}
        cancelButtonProps={{ disabled: loading }}
        okButtonProps={{ disabled: loading }}
        closeIcon={false}
      >
        {loading ? (
          <ModalSpinner />
        ) : (
          <Form form={form} layout="vertical">
            <Space
              style={{
                display: 'flex',
                marginBottom: 3,
              }}
              align="baseline"
            >
              <Form.Item
                name={['code']}
                label="Code name"
                rules={[
                  { required: true, message: 'Input code name' },
                  { validator: validateUnique },
                ]}
              >
                <Input
                  style={{
                    width: '13vw',
                  }}
                  autoFocus
                />
              </Form.Item>
              <Form.Item
                name={['display']}
                label="Code display"
                rules={[{ required: true, message: 'Input variable display' }]}
              >
                <Input
                  rows={1}
                  style={{
                    width: '13vw',
                  }}
                  autoFocus
                />
              </Form.Item>
              <Form.Item name={['description']} label="Code description">
                <TextArea
                  rows={1}
                  style={{
                    width: '30vw',
                  }}
                  autoFocus
                />
              </Form.Item>
            </Space>
          </Form>
        )}
      </Modal>
    </>
  );
};
