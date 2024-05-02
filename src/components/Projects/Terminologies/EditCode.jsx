import { message, notification, Tooltip } from 'antd';
import {
  EditOutlined,
  CloseOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useContext } from 'react';
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
  const { vocabUrl } = useContext(myContext);

  /* Submit function to edit a row. The input field is validated to ensure it is not empty.
  A copy of the dataSource with a spread operator is set to newData. The index of the row is
  found in the newData by the key of the selected row in the dataSource. The element at that
  index is set to the index variable. If the index exists, item is set to the element at that
  index. The data at the index of the row is replaced with the newData. The newData is mapped 
  through and the object is returned in the accepted terminology format. That object is placed
  a terminologyDTO variable and placed in the body of the PUT call. */
  const onFinish = async key => {
    const row = await form.validateFields();
    const newData = [...dataSource];
    const index = newData.findIndex(item => key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
      setEditRow('');
    }
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
