import { Button, Form, Modal, Pagination } from 'antd';
import { RequiredLogin } from '../../Auth/RequiredLogin';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { FilterAPI } from './FilterAPI';

export const FilterSelect = () => {
  const [form] = Form.useForm();
  const [addFilter, setAddFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { user } = useContext(myContext);
  const handleSuccess = () => {
    setAddFilter(true);
  };
  const login = RequiredLogin({ handleSuccess: handleSuccess });

  const onClose = () => {
    setCurrentPage(1);
    setPageSize(10);
  };

  //   const filterOntologies = () => {
  //     const terminologiesToExclude = new Set([
  //       ...prefTerminologies?.map(pt => pt?.id),
  //       ...displaySelectedTerminologies?.map(dst => dst?.id),
  //       ...preferredData?.map(ep => ep?.id),
  //     ]);
  //     return terminologies.filter(t => !terminologiesToExclude?.has(t.id));
  //   };

  //   const filteredTerminologyArray = filterTerminologies();

  //   // Searches for terminologies by keystroke
  //   const getFilteredItems = () =>
  //     filteredTerminologyArray?.filter(
  //       item =>
  //         item?.name &&
  //         item?.name.toLowerCase().includes(searchText.toLowerCase())
  //     );
  //     // Pagination
  //     const paginatedOntologies = getFilteredItems().slice(
  //         (currentPage - 1) * pageSize,
  //         currentPage * pageSize
  //       );

  return (
    <>
      <Button
        onClick={() => (user ? setAddFilter(true) : login())}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        API Filters
      </Button>
      <Modal
        open={addFilter}
        width={'70%'}
        styles={{
          body: {
            minHeight: '60vh',
            maxHeight: '60vh',
            overflowY: 'auto',
          },
        }}
        onOk={() => {
          form.validateFields().then(values => {
            console.log(values);
            // handleSubmit(values);
          });
        }}
        onCancel={() => {
          form.resetFields();
          setAddFilter(false);
        }}
        maskClosable={false}
        closeIcon={false}
      >
        <FilterAPI form={form} />
      </Modal>
    </>
  );
};
