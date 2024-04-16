import { useContext, useRef } from 'react';
import { myContext } from '../../../App';
import { Button, Input, message } from 'antd';
import { handleUpdate } from '../../Manager/FetchManager';

export const AddCode = ({
  terminology,
  setTerminology,
  dataSource,
  setDataSource,
}) => {
  const { vocabUrl } = useContext(myContext);
  const newCodeRef = useRef();
  const newDisplayRef = useRef();
  const newRowDTO = () => {
    let allCodes = terminology.codes;
    allCodes.push({
      code: newCodeRef.current.input.defaultValue,
      display: newDisplayRef.current.input.defaultValue,
    });
    return allCodes;
  };
  const saveNewRow = () => {
    handleUpdate(vocabUrl, 'Terminology', terminology, {
      ...terminology,
      codes: newRowDTO(),
    })
      .then(data => setTerminology(data))
      // Displays a self-closing message that the udpates have been successfully saved.
      .then(() => message.success('Changes saved successfully.'));
  };
  const handleAdd = () => {
    setDataSource([
      {
        key: 'newRow',
        code: <Input ref={newCodeRef} />,
        display: <Input ref={newDisplayRef} />,
        mapped_terms: '',
        get_mappings: <Button onClick={() => saveNewRow()}>Save</Button>,
      },
      ...dataSource,
    ]);
  };
  return (
    <div className="add_row_button">
      <Button
        onClick={() => handleAdd()}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        Add code
      </Button>
    </div>
  );
};
