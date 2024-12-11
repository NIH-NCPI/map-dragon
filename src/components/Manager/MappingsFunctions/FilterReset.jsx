import { Button, message, Modal, notification } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { SearchContext } from '../../../Contexts/SearchContext';
import { useParams } from 'react-router-dom';

export const FilterReset = ({ table, terminology }) => {
  const { confirm } = Modal;
  const { tableId } = useParams();

  const { user, vocabUrl } = useContext(myContext);
  const { preferenceTypeSet } = useContext(SearchContext);
  const [remove, setRemove] = useState(false);

  const deleteOntologies = evt => {
    // If deleting from a table, 'self' in endpoint
    // If deleting from a terminology, the terminology code in endpoint
    return fetch(
      `${vocabUrl}/${
        table
          ? `Table/${table.id}/filter/self`
          : `Terminology/${terminology.id}/filter`
      }`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
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
      .then(() =>
        // Fetch the updated api preferences
        fetch(
          `${vocabUrl}/${
            table
              ? `Table/${table.id}/filter/self`
              : `Terminology/${terminology.id}/filter`
          }`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          notification.error({
            message: 'Error',
            description: `An error occurred loading the ${
              table ? 'table' : 'terminology'
            }.`,
          });
        }
      })
      .then(data => {
        preferenceTypeSet(data);
      });
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
