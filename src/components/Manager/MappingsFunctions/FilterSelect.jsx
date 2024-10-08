import { Button, Form, Modal, Pagination } from 'antd';
import { RequiredLogin } from '../../Auth/RequiredLogin';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { FilterAPI } from './FilterAPI';
import { getOntologies } from '../FetchManager';

export const FilterSelect = () => {
  const [form] = Form.useForm();
  const [addFilter, setAddFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOntologies, setSelectedOntologies] = useState([]);
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [displaySelectedOntologies, setDisplaySelectedOntologies] = useState(
    []
  );
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user, vocabUrl, ontologyForPagination } = useContext(myContext);

  const [ontologyApis, setOntologyApis] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Gets the ontologyAPIs on first load, automatically sets active to the first of the list to display on the page
  useEffect(() => {
    setLoading(true);
    getOntologies(vocabUrl)
      .then(data => {
        setOntologyApis(data);
        if (data.length > 0) {
          setActive(data[0]?.api_id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSuccess = () => {
    setAddFilter(true);
  };
  const login = RequiredLogin({ handleSuccess: handleSuccess });

  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to page 1 when page size changes
  };

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const onClose = () => {
    setCurrentPage(1);
    setPageSize(10);
    setSelectedOntologies([]);
    setSelectedBoxes([]);
    setDisplaySelectedOntologies([]);
    setActive(ontologyApis[0]?.api_id);
  };

  const handleSubmit = values => {
    console.log(values);
    // setLoading(true);
    // const selectedMappings = selectedBoxes?.map(item => ({
    //   code: item.code,
    //   display: item.display,
    //   description: Array.isArray(item.description)
    //     ? item.description[0]
    //     : item.description,
    //   system: item.system,
    // }));
    // const mappingsDTO = {
    //   mappings: selectedMappings,
    //   editor: user.email,
    // };

    // fetch(`${vocabUrl}/Terminology/${terminology.id}/mapping/${mappingProp}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(mappingsDTO),
    // })
    //   .then(res => {
    //     if (res.ok) {
    //       return res.json();
    //     } else {
    //       throw new Error('An unknown error occurred.');
    //     }
    //   })
    //   .then(data => {
    //     setMapping(data.codes);
    //     form.resetFields();
    //     setAssignMappings(false);
    //     message.success('Changes saved successfully.');
    //   })
    //   .finally(() => setLoading(false));
  };

  // Makes a set of ontologies to exclude from the list of available ones to select(excludes those that have already been selected)
  // Converts the ontologies object into an array and filter based on the ontologiesToExclude
  const filterOntologies = () => {
    if (ontologyForPagination) {
      const firstOntology = ontologyForPagination[0];
      const ontologiesObject = firstOntology?.ontologies;
      if (ontologiesObject) {
        const ontologiesToExclude = new Set(
          displaySelectedOntologies?.map(dst => dst?.ontology_code)
        );
        const filteredOntologies = Object.values(ontologiesObject).filter(
          obj => {
            return !ontologiesToExclude.has(obj.ontology_code);
          }
        );

        return filteredOntologies;
      }
    }
  };

  const filteredOntologiesArray = filterOntologies();

  // // Pagination
  const paginatedOntologies = filteredOntologiesArray?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
            handleSubmit(values);
            onClose();
          });
        }}
        onCancel={() => {
          form.resetFields();
          setAddFilter(false);
          onClose();
        }}
        maskClosable={false}
        closeIcon={false}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <div className="modal_footer">
              <div className="modal_footer">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredOntologiesArray?.length}
                  onChange={handlePageChange}
                  showSizeChanger
                  onShowSizeChange={handlePageSizeChange}
                  pageSizeOptions={['10', '20', '50']} // Set page size options
                />
              </div>
              <div className="cancel_ok_buttons">
                <CancelBtn />
                <OkBtn />
              </div>
            </div>
          </>
        )}
      >
        <FilterAPI
          form={form}
          selectedOntologies={selectedOntologies}
          setSelectedOntologies={setSelectedOntologies}
          selectedBoxes={selectedBoxes}
          setSelectedBoxes={setSelectedBoxes}
          displaySelectedOntologies={displaySelectedOntologies}
          setDisplaySelectedOntologies={setDisplaySelectedOntologies}
          ontologyApis={ontologyApis}
          active={active}
          setActive={setActive}
          searchText={searchText}
          setSearchText={setSearchText}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          paginatedOntologies={paginatedOntologies}
        />
      </Modal>
    </>
  );
};
