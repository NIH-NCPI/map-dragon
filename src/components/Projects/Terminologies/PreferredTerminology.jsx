import { Button, Form, message, Modal, notification, Pagination } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { getAll, getById } from '../../Manager/FetchManager';
import { myContext } from '../../../App';
import { useNavigate } from 'react-router-dom';
import { ModalSpinner } from '../../Manager/Spinner';
import { SelectPreferredTerminologies } from './SelectPreferredTerminologies';
import { SearchContext } from '../../../Contexts/SearchContext';
import { RequiredLogin } from '../../Auth/RequiredLogin';

export const PreferredTerminology = ({
  terminology,
  setTerminology,
  table,
  setTable,
  componentString,
}) => {
  const [form] = Form.useForm();
  const { vocabUrl, user } = useContext(myContext);
  const {
    setPrefTerminologies,
    prefTerminologies,
    preferredData,
    setPreferredData,
  } = useContext(SearchContext);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [terminologies, setTerminologies] = useState([]);
  const [originalTerminologies, setOriginalTerminologies] = useState([]);
  const [displaySelectedTerminologies, setDisplaySelectedTerminologies] =
    useState([]);
  const [selectedTerminologies, setSelectedTerminologies] = useState([]);
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const handleSuccess = () => {
    setOpen(true);
  };
  const login = RequiredLogin({ handleSuccess: handleSuccess });

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getAll(vocabUrl, 'Terminology', navigate)
      .then(data => {
        setTerminologies(data);
        setOriginalTerminologies(data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Sets the value of the selected_terminologies in the form to the checkboxes that are selected
  useEffect(() => {
    form.setFieldsValue({
      selected_terminologies: selectedBoxes,
    });
  }, [selectedBoxes, form]);

  const handleSubmit = values => {
    setLoading(true);
    //Aggregates the values into one variable to pass to the body of the API call
    const preferredTerminologies = [
      ...(values.existing_terminologies?.map(v => JSON.parse(v)) ?? []),
      ...(values?.selected_terminologies?.map(item => ({
        preferred_terminology: item.id,
      })) ?? []),
    ];

    const preferredTermDTO = () => {
      return {
        'preferred_terminologies': preferredTerminologies,
      };
    };

    fetch(
      `${vocabUrl}/${componentString}/${
        terminology ? terminology.id : table.id
      }/preferred_terminology`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferredTermDTO()),
      }
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(() =>
        fetch(
          `${vocabUrl}/${componentString}/${
            terminology ? terminology.id : table.id
          }/preferred_terminology`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => {
        setPrefTerminologies(data?.references);
        form.resetFields();
        setOpen(false);
        message.success('Preferred terminology updated successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred saving the preferred terminology.',
          });
        }
        return error;
      })
      .then(() =>
        getById(
          vocabUrl,
          componentString,
          `${terminology ? terminology.id : table.id}`
        )
          .then(data => (terminology ? setTerminology(data) : setTable(data)))
          .catch(error => {
            if (error) {
              notification.error({
                message: 'Error',
                description: 'An error occurred loading the Terminology.',
              });
            }
            return error;
          })
      )
      .finally(() => setLoading(false));
  };

  const onClose = () => {
    setCurrentPage(1);
    setPageSize(10);
    setSelectedBoxes([]);
    setSelectedTerminologies([]);
    setDisplaySelectedTerminologies([]);
    setSearchText('');
    setPreferredData([]);
  };

  // Filters terminologies that have already been selected (by combination of name and url) out of the main terminology array to avoid duplicates
  const filterTerminologies = () => {
    const terminologiesToExclude = new Set([
      ...prefTerminologies?.map(pt => `${pt?.name}|${pt?.url}`),
      ...displaySelectedTerminologies?.map(dst => `${dst?.name}|${dst?.url}`),
      ...preferredData?.map(ep => `${ep?.name}|${ep?.url}`),
    ]);

    return terminologies.filter(
      t => !terminologiesToExclude.has(`${t?.name}|${t?.url}`)
    );
  };

  const filteredTerminologyArray = filterTerminologies();

  // Searches for terminologies by keystroke
  const getFilteredItems = () =>
    filteredTerminologyArray?.filter(
      item =>
        item?.name &&
        item?.name.toLowerCase().includes(searchText.toLowerCase())
    );

  // Pagination
  const paginatedTerminologies = getFilteredItems().slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to page 1 when page size changes
  };

  return (
    <>
      <div className="add_row_button">
        <Button
          onClick={() => (user ? setOpen(true) : login())}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          Select Terminology ({prefTerminologies?.length})
        </Button>
      </div>
      <Modal
        open={open}
        width={'60%'}
        onOk={() => {
          form.validateFields().then(values => {
            handleSubmit(values);
            onClose();
          });
        }}
        onCancel={() => {
          form.resetFields();
          onClose();
          setTerminologies(originalTerminologies);
          setOpen(false);
        }}
        closeIcon={false}
        maskClosable={false}
        destroyOnClose={true}
        cancelButtonProps={{ disabled: loading }}
        okButtonProps={{ disabled: loading }}
        styles={{
          body: {
            minHeight: '60vh',
            maxHeight: '60vh',
            overflowY: 'auto',
          },
        }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <div className="modal_footer">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={getFilteredItems().length}
                onChange={handlePageChange}
                showSizeChanger
                onShowSizeChange={handlePageSizeChange}
                pageSizeOptions={['10', '20', '50']} // Set page size options
              />
              <div className="cancel_ok_buttons">
                <CancelBtn />
                <OkBtn />
              </div>
            </div>
          </>
        )}
      >
        {loading ? (
          <ModalSpinner />
        ) : (
          <>
            <SelectPreferredTerminologies
              form={form}
              displaySelectedTerminologies={displaySelectedTerminologies}
              selectedBoxes={selectedBoxes}
              setSelectedBoxes={setSelectedBoxes}
              terminologies={terminologies}
              setTerminologies={setTerminologies}
              setDisplaySelectedTerminologies={setDisplaySelectedTerminologies}
              setSelectedTerminologies={setSelectedTerminologies}
              searchText={searchText}
              setSearchText={setSearchText}
              paginatedTerminologies={paginatedTerminologies}
              open={open}
            />
          </>
        )}
      </Modal>
    </>
  );
};
