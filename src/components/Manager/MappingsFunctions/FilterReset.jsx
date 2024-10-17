import { Button, message, Modal, notification } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { SearchContext } from '../../../Contexts/SearchContext';

export const FilterReset = ({ table }) => {
  const { confirm } = Modal;

  const { user, vocabUrl } = useContext(myContext);
  const { setApiPreferences } = useContext(SearchContext);
  const [remove, setRemove] = useState(false);

  const deleteOntologies = evt => {
    return fetch(`${vocabUrl}/${table?.terminology?.reference}/filter`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ editor: user.email }),
    })
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
