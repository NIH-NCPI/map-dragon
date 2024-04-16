import { useContext, useEffect, useRef, useState } from 'react';
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
  const [addRow, setAddRow] = useState(false);
  const newCodeRef = useRef();
  const newDisplayRef = useRef();

  console.log(addRow);

  useEffect(() => {
    addRow && handleAdd();
  }, [addRow]);

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
    handleUpdate(vocabUrl, 'Terminology', terminology, {
      ...terminology,
      codes: newRowDTO(),
    })
      .then(data => setTerminology(data))
      // Displays a self-closing message that the udpates have been successfully saved.
      .then(() => message.success('Changes saved successfully.'));
  };

  const rowButtons = () => {
    return (
      <>
        <span>
          <Button onClick={() => setAddRow(false)}>Cancel</Button>{' '}
          <Button onClick={() => saveNewRow()}>Save</Button>
        </span>
      </>
    );
  };

  console.log(addRow);
  // Sets the data source for the table to input fields with respective refs.
  // A save button in the end that calls the saveNewRow PUT request function on click.
  const handleAdd = () => {
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

  return (
    <div className="add_row_button">
      <Button
        onClick={() => {
          setAddRow(true);
        }}
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
