import { message, notification, Tooltip } from 'antd';
import {
  EditOutlined,
  CloseOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { DeleteCode } from './DeleteCode';
import { handleUpdate } from '../../Manager/FetchManager';

export const EditCode = ({
  editRow,
  setEditRow,
  tableData,
  terminology,
  setTerminology,
  dataSource,
  setDataSource,
  form,
}) => {
  const { vocabUrl, mapping, setMapping } = useContext(myContext);

  /* Submit function to edit a row. The input field is validated to ensure it is not empty.
     The index of the row being edited is found by the key of the row in the dataSource. 
     The element at that index is set to the index variable. If the index exists, item is set to 
     the element at that index. The data at the index of the row is replaced with the newData. 
     The data is mapped through and the object is returned in the accepted terminology format. 
     That object is placed in a terminologyDTO variable and placed in the body of the PUT call. */
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
    const updateMapping = () => {
      const updatedCopy = mapping.map(item =>
        item.code === dataSource[index].code
          ? { ...item, code: row.code }
          : item
      );
      setMapping(updatedCopy);
      return updatedCopy;
    };

    console.log(updateMapping());
    const updatedData = newData.map(item => {
      return { code: item.code, display: item.display };
    });

    const terminologyDTO = { ...terminology, codes: updatedData };
    handleUpdate(vocabUrl, 'Terminology', terminology, terminologyDTO)
      .then(data => {
        setTerminology(data);
        setDataSource(updatedData);
        message.success('Changes saved successfully.');
      })

      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred editing the code. Please try again.',
          });
        }
        return error;
      });
    fetch(`${vocabUrl}/Terminology/${terminology.id}/mapping`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateMapping()),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => {
        setMapping(data.codes);
      });
    //   .catch(error => {
    //     if (error) {
    //       notification.error({
    //         message: 'Error',
    //         description: 'An error occurred. Please try again.',
    //       });
    //     }
    //     return error;
    //   })
  };

  return (
    <>
      {' '}
      {editRow !== tableData.key ? (
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
      )}
    </>
  );
};
