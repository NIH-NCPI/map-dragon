import { message, notification, Tooltip } from 'antd';
import {
  EditOutlined,
  CloseOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useContext, useEffect } from 'react';
import { myContext } from '../../../App';
import { Spinner } from '../../Manager/Spinner';
import { getById, handlePatch } from '../../Manager/FetchManager';
import { useParams } from 'react-router-dom';
import { MappingContext } from '../../../MappingContext';
import { DeleteVariable } from './DeleteVariable';

export const EditVariable = ({
  editRow,
  setEditRow,
  tableData,
  table,
  setTable,
  dataSource,
  setDataSource,
  form,
  loading,
  setLoading,
}) => {
  const { vocabUrl } = useContext(myContext);
  const { setMapping } = useContext(MappingContext);
  const { tableId } = useParams();

  /* Submit function to edit a row. The input field is validated to ensure it is not empty.
     The index of the row being edited is found by the key of the row in the dataSource. 
     The element at that index is set to the index variable. If the index exists, item is set to 
     the element at that index. The data at the index of the row is replaced with the newData. 
      */

  useEffect(() => {
    if (editRow !== null && dataSource[editRow]) {
      const { name, description } = dataSource[editRow];
      form.setFieldsValue({ name, description });
    }
  }, [editRow]);

  const onFinish = async key => {
    const row = await form.validateFields();
    const index = dataSource.findIndex(item => key === item.key);
    const newData = [...dataSource];
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
    }

    // Object to put in the body of the PATCH request. Provides the old variable
    // and replaces with the updated variable and/or description on the back end.
    // The variable in the associdated mappings is automatically udpated on the back end.
    const updatedRowDTO = {
      variable: {
        [`${dataSource[index].name}`]: `${row.name}`,
      },
      description: {
        [dataSource[index].name]: row.description,
      },
    };

    if (
      table.variables.some(
        item =>
          item.name.toLowerCase() === row.name.toLowerCase() &&
          dataSource[index].name.toLowerCase() !== row.name.toLowerCase()
      )
    ) {
      message.error(
        `"${row.name}" already exists in the Table. Please choose a different name.`
      );
    } else {
      setLoading(true);
      handlePatch(vocabUrl, 'Table', table, updatedRowDTO)
        .then(data => {
          setTable(data);
          setDataSource(newData);
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
          getById(vocabUrl, 'Table', `${tableId}/mapping`)
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
    }
  };

  return (
    <>
      {!loading ? (
        editRow !== tableData.key ? (
          /* if the row is not being edited, the edit and delete icons are displayed*/
          <>
            <Tooltip title="Edit">
              {' '}
              <EditOutlined
                onClick={() => {
                  /* editRow is set to the key of the of the row.*/
                  setEditRow(tableData.key);
                }}
                className="actions_icon"
              />
            </Tooltip>
            <Tooltip title="Delete">
              <DeleteVariable
                tableData={tableData}
                table={table}
                setTable={setTable}
              />{' '}
            </Tooltip>
          </>
        ) : (
          //if the row is being edited, the cancel and save icons are displayed
          <>
            {' '}
            <Tooltip title="Cancel">
              <CloseOutlined
                className="actions_icon"
                onClick={() => setEditRow('')}
              />
            </Tooltip>
            <Tooltip title="Save">
              <CloudUploadOutlined
                className="actions_icon"
                onClick={() => onFinish(tableData.key)}
              />
            </Tooltip>
          </>
        )
      ) : (
        <Spinner />
      )}
    </>
  );
};
