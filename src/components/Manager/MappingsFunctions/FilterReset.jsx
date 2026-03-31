import { Button, message, Modal, notification } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { SearchContext } from '../../../Contexts/SearchContext';
import { useParams } from 'react-router-dom';
import { getById } from '../FetchManager';

export const FilterReset = ({
  table,
  terminology,
  setExistingOntologies,
  setExistingPreferred,
  setPrefTerminologies,
  componentString
}) => {
  const { confirm } = Modal;

  const { user, vocabUrl } = useContext(myContext);
  const { preferenceTypeSet } = useContext(SearchContext);
  const [remove, setRemove] = useState(false);

  useEffect(() => {
    if (remove) {
      showConfirm();
    }
  }, [remove]);

  const deleteOntologies = async evt => {
    try {
      const ontoDelete = await fetch(
        `${vocabUrl}/${
          table
            ? `Table/${table.id}/filter/self`
            : `Terminology/${terminology.id}/filter`
        }`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ editor: user.email })
        }
      );

      const terminologyDelete = await fetch(
        `${vocabUrl}/${componentString}/${
          table ? table.id : terminology.id
        }/preferred_terminology`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ editor: user.email })
        }
      );

      setExistingOntologies([]);
      setExistingPreferred([]);
      setPrefTerminologies([]);
      preferenceTypeSet({ self: { api_preference: {} } });
      message.success('Filters deleted successfully.');
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'An error occurred deleting preferences.'
      });
    }
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
      }
    });
  };

  return (
    <>
      <Button danger onClick={() => (user ? setRemove(true) : login())}>
        Reset
      </Button>
    </>
  );
};
