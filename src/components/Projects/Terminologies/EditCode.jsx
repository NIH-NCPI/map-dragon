import { message, notification, Tooltip } from 'antd';
import {
  EditOutlined,
  CloseOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { DeleteCode } from './DeleteCode';
import { Spinner } from '../../Manager/Spinner';
import { getById, handlePatch } from '../../Manager/FetchManager';
import { useParams } from 'react-router-dom';
import { MappingContext } from '../../../MappingContext';

export const EditCode = ({
  editRow,
  setEditRow,
  tableData,
  terminology,
  setTerminology,
  dataSource,
  setDataSource,
  form,
  loading,
  setLoading,
}) => {
  const { vocabUrl } = useContext(myContext);
  const { setMapping } = useContext(MappingContext);
  const { terminologyId } = useParams();

  /* Submit function to edit a row. The input field is validated to ensure it is not empty.
     The index of the row being edited is found by the key of the row in the dataSource. 
     The element at that index is set to the index variable. If the index exists, item is set to 
     the element at that index. The data at the index of the row is replaced with the newData. 
      */
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
      setEditRow('');
    }
    // Object to put in the body of the PATCH request. Provides the old code
    // and replaces with the updated code and/or display on the back end.
    // The code in the associdated mappings is automatically udpated on the back end.
    const updatedRowDTO = {
      code: {
        [`${dataSource[index].code}`]: `${row.code}`,
      },
      display: {
        [dataSource[index].code]: row.display,
      },
    };
    setLoading(true);
    handlePatch(vocabUrl, 'Terminology', terminology, updatedRowDTO)
      .then(data => {
        setTerminology(data);
        setDataSource(newData);
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
      {!loading ? (
        editRow !== tableData.key ? (
          /* if the row is not being edited, the edit and delete icons are displayed*/
          <>
            <Tooltip title="Edit">
              {' '}
              <EditOutlined
                onClick={() => {
                  /* editRow is set to the key of the of the row. The form values are set 
                to the code and display of the tableData.*/
                  setEditRow(tableData.key);
                  form.setFieldsValue({
                    code: tableData.code,
                    display: tableData.display,
                  });
                }}
                className="actions_icon"
              />
            </Tooltip>
            <Tooltip title="Delete">
              <DeleteCode
                tableData={tableData}
                terminology={terminology}
                setTerminology={setTerminology}
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
