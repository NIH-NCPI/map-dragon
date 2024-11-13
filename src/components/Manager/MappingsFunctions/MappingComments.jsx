import { Button, Form, Input, Modal, notification } from 'antd';
import { useContext } from 'react';
import { myContext } from '../../../App';

export const MappingComments = ({
  code,
  variableMappings,
  setComment,
  terminologyId,
}) => {
  const [form] = Form.useForm();
  const { vocabUrl, user } = useContext(myContext);
  const { TextArea } = Input;

  const onClose = () => {
    setComment(null);
  };

  const onFinish = values => {
    const mappingCommentDTO = {
      editor: user?.email,
      note: values.comment,
    };

    return fetch(
      `${vocabUrl}/Terminology/${terminologyId}/user_input/${variableMappings}/${code}/mapping_conversations`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappingCommentDTO),
      }
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred saving the comment.',
          });
        }
        return error;
      });
  };

  return (
    <>
      <Modal
        open={!!code}
        width={'70%'}
        styles={{
          body: {
            minHeight: '60vh',
            maxHeight: '60vh',
          },
        }}
        footer={[<Button onClick={onClose}>Close</Button>]}
        maskClosable={false}
        closeIcon={false}
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="inline"
          onFinish={() => {
            form.validateFields().then(values => {
              onFinish(values);
              onClose();
            });
          }}
          preserve={false}
        >
          <Form.Item name="comment">
            <TextArea
              rows={1}
              style={{
                width: 500,
                resize: 'both',
              }}
              showCount
              maxLength={1000}
              autoFocus
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Comment
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
