import { Button } from 'antd';
import { useContext, useState } from 'react';
import { getById } from '../../Manager/FetchManager';
import { myContext } from '../../../App';
import { message, notification, Popconfirm } from 'antd';
import Papa from 'papaparse';

export const ExportFile = ({ table }) => {
  const { vocabUrl } = useContext(myContext);

  // gets the harmony of mappings, then unparses it to a CSV object. A blob is created
  // containing the csv data. A URL is created to represent the csv as a downloadable resource.
  // A download link is created. The href specifies the location of the file to be downloaded on click.
  // The download attribute is set to download the file as 'mappings.csv'. The file is downloaded on click.
  const getHarmony = () => {
    return getById(vocabUrl, 'Table', `${table.id}/harmony`)
      .then(data => {
        const csv = Papa.unparse(data);
        const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const csvURL = window.URL.createObjectURL(csvData);
        const downloadLink = document.createElement('a');
        downloadLink.href = csvURL;
        downloadLink.setAttribute('download', 'mappings.csv');
        downloadLink.click();
      })
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
    <Popconfirm
      title="Export mappings for the table?"
      onConfirm={() => getHarmony()}
    >
      <Button type="primary" className="export_button">
        Export
      </Button>
    </Popconfirm>
  );
};
