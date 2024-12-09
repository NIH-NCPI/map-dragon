import { Button, Form, Input, Modal, notification } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { MappingContext } from '../../../Contexts/MappingContext';
import { ModalSpinner } from '../Spinner';
import { getById } from '../FetchManager';

export const MappingComments = ({
  mappingCode,
  mappingDisplay,
  variableMappings,
  setComment,
  idProp,
  setMapping,
}) => {
  const [form] = Form.useForm();
  const { vocabUrl, user } = useContext(myContext);
  const { mappingComments, setMappingComments } = useContext(MappingContext);
  const [loading, setLoading] = useState(false);
  const { TextArea } = Input;

  const onClose = () => {
    setComment(null);
    setMappingComments([]);
  };

  useEffect(() => {
    if (!!mappingCode) {
      getComments();
    }
  }, [mappingCode]);

  const getComments = () => {
    setLoading(true);
    return fetch(
      `${vocabUrl}/Terminology/${idProp}/user_input/${variableMappings}/mapping/${mappingCode}/mapping_conversations`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => setMappingComments(data?.mapping_conversations))
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred saving the comment.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  };

  const onFinish = values => {
    const mappingCommentDTO = {
      editor: user?.email,
      note: values.comment,
    };

    return fetch(
      `${vocabUrl}/Terminology/${idProp}/user_input/${variableMappings}/mapping/${mappingCode}/mapping_conversations`,
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
      .then(data => setMappingComments(data?.mapping_conversations))
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred saving the comment.',
          });
        }
        return error;
      })
      .then(() =>
        getById(
          vocabUrl,
          'Terminology',
          `${idProp}/mapping?user_input=True&user=${user?.email}`
        )
          .then(data => setMapping(data.codes))
          .catch(error => {
            if (error) {
              notification.error({
                message: 'Error',
                description: 'An error occurred loading mappings.',
              });
            }
            return error;
          })
      );
  };

  const formattedDate = dateString => {
    const date = new Date(dateString);

    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const commentDisplay = (mc, i) => {
    return (
      <div key={i} className="comment_container">
        <div className="comment_note">{mc.note}</div>
        <div className="comment_date_user">
          <div>{formattedDate(mc.date)}</div>
          <div>{mc.user_id}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Modal
        open={!!mappingCode}
        width={'70%'}
        styles={{
          body: {
            minHeight: '60vh',
            maxHeight: '60vh',
            overflowY: 'auto',
          },
        }}
        footer={[<Button onClick={onClose}>Close</Button>]}
        maskClosable={false}
        closeIcon={false}
        destroyOnClose={true}
      >
        <span className="comment_code_display">{variableMappings}: </span>
        {mappingDisplay ? mappingDisplay : mappingCode}
        <Form
          form={form}
          layout="inline"
          onFinish={() => {
            form.validateFields().then(values => {
              onFinish(values);
              form.resetFields();
            });
          }}
          preserve={false}
        >
          <Form.Item name="comment">
            <TextArea
              rows={1}
              style={{
                width: 500,
                resize: 'vertical',
              }}
              showCount
              maxLength={1000}
              autoFocus
              className="comment_textarea"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Comment
            </Button>
          </Form.Item>
        </Form>
        {loading ? (
          <ModalSpinner />
        ) : (
          mappingComments?.map((mc, i) => commentDisplay(mc, i))
        )}
      </Modal>
    </>
  );
};
