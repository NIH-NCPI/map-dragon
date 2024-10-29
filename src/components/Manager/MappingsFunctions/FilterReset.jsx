import { Button, message, Modal, notification } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { SearchContext } from '../../../Contexts/SearchContext';
import { useParams } from 'react-router-dom';
import { cleanedName } from '../Utilitiy';

export const FilterReset = ({ table, component, terminology }) => {
  const { confirm } = Modal;
  const { tableId } = useParams();

  const { user, vocabUrl } = useContext(myContext);
  const { setApiPreferences } = useContext(SearchContext);
  const [remove, setRemove] = useState(false);

  const deleteOntologies = evt => {
    return fetch(
      `${vocabUrl}/Table/${tableId}/filter/${
        component === table ? 'self' : cleanedName(terminology?.name)
      }`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ editor: user.email }),
      }
    )
      .then(res => {
        if (res.ok) {
          return res.json().then(data => {
            message.success('Ontology filters deleted successfully.');
          });
        } else {
          notification.error({
            message: 'Error',
            description: 'An error occurred deleting the table.',
          });
        }
      })
      .then(data => setApiPreferences(data));
  };

  const showConfirm = () => {
    confirm({
      className: 'delete_table_confirm',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content:
        '          Are you sure you want to remove the ontology filters?',
      onOk() {
        deleteOntologies();
        setRemove(false);
      },
      onCancel() {
        setRemove(false);
      },
    });
  };

  return (
    <>
      <Button danger onClick={() => (user ? setRemove(true) : login())}>
        Reset
      </Button>
      {remove && showConfirm()}
    </>
  );
};
