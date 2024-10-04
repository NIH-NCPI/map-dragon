import { Button, Form, Modal } from 'antd';
import { RequiredLogin } from '../../Auth/RequiredLogin';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { FilterAPI } from './FilterAPI';

export const FilterSelect = () => {
  const [form] = Form.useForm();
  const [addFilter, setAddFilter] = useState(false);
  const { user } = useContext(myContext);
  const handleSuccess = () => {
    setAddFilter(true);
  };
  const login = RequiredLogin({ handleSuccess: handleSuccess });

  return (
    <>
      <Button
        onClick={() => (user ? setAddFilter(true) : login())}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        API Filters
      </Button>
      <Modal
        open={addFilter}
        width={'70%'}
        styles={{
          body: {
            minHeight: '60vh',
            maxHeight: '60vh',
            overflowY: 'auto',
          },
        }}
        onOk={() => {
          form.validateFields().then(values => {
            console.log(values);
            // handleSubmit(values);
          });
        }}
        onCancel={() => {
          form.resetFields();
          setAddFilter(false);
        }}
        maskClosable={false}
        closeIcon={false}
      >
        <FilterAPI form={form} />
      </Modal>
    </>
  );
};
