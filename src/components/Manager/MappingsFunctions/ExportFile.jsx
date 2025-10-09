import { useContext } from 'react';
import { getById } from '../../Manager/FetchManager';
import { myContext } from '../../../App';
import { Modal, notification, Popconfirm } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import Papa from 'papaparse';

export const ExportFile = ({ componentString, component }) => {
  const { vocabUrl, exportState, setExportState } = useContext(myContext);
  const { confirm } = Modal;

  // gets the harmony of mappings, then unparses it to a CSV object. A blob is created
  // containing the csv data. A URL is created to represent the csv as a downloadable resource.
  // A download link is created. The href specifies the location of the file to be downloaded on click.
  // The download attribute is set to download under '[component name] mappings'. The file is downloaded on click.
  const getHarmony = () => {
    return getById(vocabUrl, componentString, `${component.id}/harmony`)
      .then(data => {
        const csv = Papa.unparse(data);
        const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const csvURL = window.URL.createObjectURL(csvData);
        const downloadLink = document.createElement('a');
        downloadLink.href = csvURL;
        downloadLink.setAttribute('download', `${component.name} mappings`);
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

  const showConfirm = () => {
    confirm({
      className: 'delete_table_confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Are you sure you want to export mappings as Harmony?',
      onOk() {
        getHarmony();
        setExportState(false);
      },
      onCancel() {
        setExportState(false);
      },
    });
  };

  return exportState && showConfirm();
};
