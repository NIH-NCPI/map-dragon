import { Button } from 'antd';
import { useContext, useState } from 'react';
import { getById } from '../../Manager/FetchManager';
import { myContext } from '../../../App';
import { message, notification } from 'antd';
import Papa from 'papaparse';

export const ExportFile = ({ table }) => {
  const [harmony, setHarmony] = useState([]);
  const { vocabUrl } = useContext(myContext);

  const getHarmony = () => {
    return getById(vocabUrl, 'Table', `${table.id}/harmony`)
      .then(data => {
        setHarmony(data);
        const csv = Papa.unparse(data);
        const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const csvURL = window.URL.createObjectURL(csvData);
        const downloadLink = document.createElement('a');
        downloadLink.href = csvURL;
        downloadLink.setAttribute('test', 'test.csv');
        downloadLink.click();
      })
      .finally(() => message.success('File downloaded successfully.'))
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred exporting mappings. Please try again.',
          });
        }
        return error;
      });
  };

  return (
    <Button
      type="primary"
      className="export_button"
      onClick={() => getHarmony()}
    >
      Export
    </Button>
  );
};
