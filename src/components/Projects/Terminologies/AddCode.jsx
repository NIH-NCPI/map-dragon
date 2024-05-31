import { useContext, useRef, useState } from 'react';
import { myContext } from '../../../App';
import { Button, Input, message } from 'antd';
import { handleUpdate } from '../../Manager/FetchManager';
import './Terminology.scss';

export const AddCode = ({
  terminology,
  setTerminology,
  dataSource,
  setDataSource,
}) => {
  const { vocabUrl } = useContext(myContext);
  const [addRow, setAddRow] = useState(false);

  const newCodeRef = useRef();
  const newDisplayRef = useRef();

  // allCodes set to the terminology codes array. Then the refs from the code and display
  // input fields are pushed to the allCodes array to be attached to the body of the PUT request.
  const newRowDTO = () => {
    let allCodes = terminology.codes;
    allCodes.push({
      code: newCodeRef.current.input.defaultValue,
      display: newDisplayRef.current.input.defaultValue,
    });
    return allCodes;
  };

  // Takes the newRowDTO function above and adds it to the body of the PUT request to add new codes to the codes array
  const saveNewRow = () => {
    newCodeRef.current.input.defaultValue === '' ||
    newDisplayRef.current.input.defaultValue === ''
      ? message.error('Please fill out the code and display.')
      : terminology.codes.some(
          item =>
            item.code.toLowerCase() ===
            newCodeRef.current.input.defaultValue.toLowerCase()
        )
      ? message.error(
          `"${newCodeRef.current.input.defaultValue}" already exists in the Terminology. Please choose a different name.`
        )
      : handleUpdate(vocabUrl, 'Terminology', terminology, {
          ...terminology,
          codes: newRowDTO(),
        })
          .then(data => setTerminology(data))
          .then(() => setAddRow(false))
          // Displays a self-closing message that the udpates have been successfully saved.
          .then(() => message.success('Code added successfully.'));
  };

  const rowButtons = () => {
    return (
      <>
        <span className="add_row_buttons">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={saveNewRow}>Save</Button>
        </span>
      </>
    );
  };

  // Sets the data source for the table to input fields with respective refs.
  // A save button in the end that calls the saveNewRow PUT request function on click.
  const handleAdd = () => {
    setAddRow(true);
    setDataSource([
      {
        key: 'newRow',
        code: <Input ref={newCodeRef} />,
        display: <Input ref={newDisplayRef} />,
        mapped_terms: '',
        get_mappings: rowButtons(),
      },
      ...dataSource,
    ]);
  };

  const handleCancel = () => {
    setDataSource(dataSource);
    setAddRow(false);
  };

  return (
    <div className="add_row_button">
      <Button
        onClick={handleAdd}
        type="primary"
        style={{
          marginBottom: 16,
        }}
        disabled={addRow}
      >
        Add code
      </Button>
    </div>
  );
};
