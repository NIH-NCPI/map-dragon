import { useContext } from 'react';
import { myContext } from '../../../App';
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  notification,
  Row,
  Table,
  Tooltip,
} from 'antd';

export const AddCode = ({ terminology }) => {
  const { setTerminology } = useContext(myContext);
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
};
