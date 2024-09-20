import {
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Modal,
  notification,
  Pagination,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useContext, useEffect, useRef, useState } from 'react';
import { getAll } from '../../Manager/FetchManager';
import { myContext } from '../../../App';
import { Link, useNavigate } from 'react-router-dom';
import { ellipsisString } from '../../Manager/Utilitiy';
import { ModalSpinner } from '../../Manager/Spinner';

export const PreferredTerminology = ({ terminology, setTerminology }) => {
  const [form] = Form.useForm();
  const { Search } = Input;

  const { vocabUrl, user } = useContext(myContext);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [terminologies, setTerminologies] = useState([]);
  const [displaySelectedTerminologies, setDisplaySelectedTerminologies] =
    useState([]);
  const [selectedTerminologies, setSelectedTerminologies] = useState([]);
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    getAll(vocabUrl, 'Terminology', navigate)
      .then(data => {
        setTerminologies(data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Sets the value of the selected_mappings in the form to the checkboxes that are selected
  useEffect(() => {
    form.setFieldsValue({
      selected_terminologies: selectedBoxes,
    });
  }, [selectedBoxes, form]);

  const handleSubmit = values => {
    setLoading(true);
    const preferredTerminologies = values?.selected_terminologies?.map(
      item => ({
        preferred_terminology: item.id,
      })
    );

    const preferredTermDTO = () => {
      return {
        'editor': user.email,
        'preferred_terminologies': [preferredTerminologies],
      };
    };

    fetch(`${vocabUrl}/Terminology/${terminology.id}/preferred_terminology`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferredTermDTO()),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => {
        setTerminology(data);
        form.resetFields();
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
      .finally(() => setLoading(false));
  };

  const onClose = () => {
    setCurrentPage(1);
    setPageSize(10);
    setSelectedBoxes([]);
    setSelectedTerminologies([]);
    setDisplaySelectedTerminologies([]);
    setOpen(false);
  };

  const getFilteredItems = () =>
    terminologies?.filter(
      item =>
        item?.name &&
        item?.name.toLowerCase().includes(searchText.toLowerCase())
    );
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

  // If the checkbox is checked, it adds the object to the selectedBoxes array
  // If it is unchecked, it filters it out of the selectedBoxes array.
  const onCheckboxChange = (event, terminology) => {
    if (event.target.checked) {
      setSelectedBoxes(prevState => [...prevState, terminology]);
    } else {
      setSelectedBoxes(prevState =>
        prevState.filter(val => val !== terminology)
      );
    }
  };

  const onSelectedChange = checkedValues => {
    const selected = JSON.parse(checkedValues?.[0]);
    const selectedTerminology = terminologies.find(
      term => term.id === selected.preferred_terminology
    );

    // Updates selectedTerminologies and displayselectedTerminologys to include the new selected items
    setSelectedTerminologies(prevState => [...prevState, selectedTerminology]);

    // Adds the selectedTerminologies to the selectedBoxes to ensure they are checked
    setSelectedBoxes(prevState => {
      const updated = [...prevState, selectedTerminology];
      // Sets the values for the form to the selectedTerminologiess checkboxes that are checked
      form.setFieldsValue({ selected_terminologies: updated });
      return updated;
    });

    setDisplaySelectedTerminologies(prevState => [
      ...prevState,
      selectedTerminology,
    ]);

    // Filters out the selected checkboxes from the results being displayed
    const updatedTerminologies = terminologies.filter(
      term => term.id !== selected.preferred_terminology
    );
    setTerminologies(updatedTerminologies);
  };

  const selectedTermsDisplay = (selected, index) => {
    return (
      <>
        <div key={index} className="modal_display_result">
          <div>
            <div className="modal_term_ontology">
              <div>
                <Link
                  to={`/Terminology/${selected.id}`}
                  target="_blank"
                  className="terminology_link"
                >
                  {selected?.name ? selected.name : selected.id}
                </Link>
              </div>
            </div>
            <div>{ellipsisString(selected?.description, '100')}</div>
          </div>
        </div>
      </>
    );
  };

  const checkBoxDisplay = (item, index) => {
    return (
      <>
        <div key={index} className="modal_search_result">
          <div>
            <div className="modal_term_ontology">
              <div>
                <Link
                  to={`/Terminology/${item.id}`}
                  target="_blank"
                  className="terminology_link"
                >
                  {item?.name ? item.name : item.id}
                </Link>
              </div>
            </div>
            <div>{ellipsisString(item?.description, '100')}</div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="add_row_button">
        <Button
          onClick={() => setOpen(true)}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          Select Terminology
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
        }}
        closeIcon={false}
        maskClosable={false}
        destroyOnClose={true}
        cancelButtonProps={{ disabled: loading }}
        okButtonProps={{ disabled: loading }}
        styles={{ body: { height: '60vh', overflowY: 'auto' } }}
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
            {' '}
            <div className="modal_search_results_header">
              <h3>Terminologies</h3>
              <div className="mappings_search_bar">
                <Search
                  placeholder="Search terminologies"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
              </div>
            </div>
            <Form form={form} layout="vertical" preserve={false}>
              <Form.Item
                name={['preferred_terminology']}
                valuePropName="value"
                // Each checkbox is checked by default. The user can uncheck a checkbox to remove a mapping by clicking the save button.
              >
                <div className="result_container">
                  <Form form={form} layout="vertical">
                    {displaySelectedTerminologies?.length > 0 && (
                      <Form.Item
                        name="selected_terminologies"
                        valuePropName="value"
                        rules={[{ required: false }]}
                      >
                        <div className="modal_display_results">
                          {displaySelectedTerminologies?.map((selected, i) => (
                            <Checkbox
                              key={i}
                              checked={selectedBoxes.some(
                                box => box.id === selected.id
                              )}
                              value={selected}
                              onChange={e => onCheckboxChange(e, selected)}
                            >
                              {selectedTermsDisplay(selected, i)}
                            </Checkbox>
                          ))}
                        </div>
                      </Form.Item>
                    )}
                    <Form.Item
                      name={['terminologies']}
                      valuePropName="value"
                      rules={[
                        {
                          required: false,
                        },
                      ]}
                    >
                      {paginatedTerminologies?.length > 0 ? (
                        <Checkbox.Group
                          className="mappings_checkbox"
                          options={paginatedTerminologies?.map(
                            (term, index) => {
                              return {
                                value: JSON.stringify({
                                  preferred_terminology: term.id,
                                }),
                                label: checkBoxDisplay(term, index),
                              };
                            }
                          )}
                          onChange={onSelectedChange}
                        />
                      ) : (
                        ''
                      )}
                    </Form.Item>
                  </Form>
                </div>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
};
