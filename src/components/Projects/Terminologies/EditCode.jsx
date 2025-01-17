import { Form, Input, message, Modal, notification, Space } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { ModalSpinner } from '../../Manager/Spinner';
import { getById, handlePatch } from '../../Manager/FetchManager';
import { useParams } from 'react-router-dom';
import { MappingContext } from '../../../Contexts/MappingContext';

export const EditCode = ({
  editRow,
  setEditRow,
  tableData,
  terminology,
  setTerminology,
  form,
  setSelectedKey,
}) => {
  const [loading, setLoading] = useState(false);
  const { TextArea } = Input;
  const { vocabUrl, user } = useContext(myContext);
  const { setMapping } = useContext(MappingContext);
  const { terminologyId } = useParams();

  /* Submit function to edit a row. The input field is validated to ensure it is not empty.
     The index of the row being edited is found by the key of the row in the dataSource. 
     The element at that index is set to the index code. If the index exists, item is set to 
     the element at that index. The data at the index of the row is replaced with the newData. 
      */

  useEffect(() => {
    if (editRow === tableData.key) {
      form.setFieldsValue({
        code: tableData.code,
        display: tableData.display,
        description: tableData.description,
      });
    }
  }, [editRow, tableData, form]);

  const validateUnique = (_, value) => {
    // Validator function for form. Checks if the term being added already exists.
    const isUnique = !terminology.codes.some(
      item =>
        item.code.toLowerCase() === value.toLowerCase() &&
        value.toLowerCase() !== tableData.code.toLowerCase()
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
    // Object to put in the body of the PATCH request. Provides the old code
    // and replaces with the updated code and/or display on the back end.
    // The code in the associdated mappings is automatically udpated on the back end.

    setLoading(true);
    const updatedRowDTO = {
      code: {
        [`${tableData.code}`]: `${values.code}`,
      },
      display: {
        [tableData.code]: values.display,
      },
      description: {
        [tableData.code]: values.description,
      },
    };
    // // If the new code already exists in the terminolgoy and does not match the index being edited,
    // // an error message displays that the code already exists. Otherwise the PUT call is run.

    handlePatch(vocabUrl, 'Terminology', terminology, {
      ...updatedRowDTO,
      // editor: user.email,
    })
      .then(data => {
        setTerminology(data);
        form.resetFields();
        setEditRow('');
        message.success('Changes saved successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred updating the row. Please try again.',
          });
        }
        return error;
      })
      .then(() =>
        getById(vocabUrl, 'Terminology', `${terminologyId}/mapping`)
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
      )
      .finally(() => setLoading(false));
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
              setSelectedKey(null);
            });
          }}
          onCancel={() => {
            form.resetFields();
            setEditRow(null);
            setSelectedKey(null);
          }}
          maskClosable={false}
          destroyOnClose={true}
          cancelButtonProps={{ disabled: loading }}
          okButtonProps={{ disabled: loading }}
          closeIcon={false}
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
                  name={['code']}
                  label="Code"
                  rules={[
                    { required: true, message: 'Code is required.' },
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
                  name={['display']}
                  label="Code display"
                  rules={[
                    {
                      required: true,
                      message: 'Code display is required.',
                    },
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
                <Form.Item name={['description']} label="Code description">
                  <TextArea
                    autoSize={true}
                    style={{
                      width: '36vw',
                    }}
                    autoFocus
                  />
                </Form.Item>
              </Space>
            </Form>
          )}
        </Modal>
      )}
    </>
  );
};
