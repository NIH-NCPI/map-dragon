import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { myContext } from '../../../App';
import './Terminology.scss';
import { Spinner } from '../../Manager/Spinner';
import Background from '../../../assets/Background.png';
import { getById, handleUpdate } from '../../Manager/FetchManager';
import { Table, Tooltip, Modal, Form, Col, Row, message } from 'antd';
import { EditMappingsModal } from './EditMappingModal';
import { GetMappingsModal } from './GetMappingsModal';
import { SettingsDropdown } from '../../Manager/SettingsDropdown';
import { EditTerminologyDetails } from './EditTerminologyDetails';

export const Terminology = () => {
  const [form] = Form.useForm();

  const { terminologyId } = useParams();
  const {
    terminology,
    setTerminology,
    vocabUrl,
    loading,
    setLoading,
    editMappings,
    setEditMappings,
    getMappings,
    setGetMappings,
    edit,
    setEdit,
  } = useContext(myContext);

  const [mapping, setMapping] = useState({});
  const [terminologyEdit, setTerminologyEdit] = useState(false);

  // Fetches the terminoology using the terminologyId param and sets 'terminology' to the response.
  // Fetches the mappings for the terminology and sets the response to 'mapping'
  // Sets loading to false
  useEffect(() => {
    setLoading(true);
    getById(vocabUrl, 'Terminology', terminologyId).then(data =>
      setTerminology(data)
    );
    getById(vocabUrl, 'Terminology', `${terminologyId}/mapping`)
      .then(data => setMapping(data.codes))
      .then(() => setLoading(false));
  }, []);

  /* The terminology may have numerous codes. The API call to fetch the mappings returns all mappings for the terminology.
The codes in the mappings need to be matched up to each code in the terminology.
The function maps through the mapping array. For each code, if the mapping code is equal to the 
code in the terminology, AND the mappings array length for the code is > 0, the mappings array is mapped through
and returns the length of the mapping array (i.e. returns the number of codes mapped to the terminology code). 
There is then a tooltip that displays the codes on hover.*/
  const matchCode = code =>
    mapping?.length > 0
      ? mapping?.map((item, index) =>
          item.code === code.code && item?.mappings?.length > 0 ? (
            <Tooltip
              title={item.mappings.map(code => {
                return <div>{code.code}</div>;
              })}
              key={index}
            >
              {item.mappings.length}
            </Tooltip>
          ) : (
            ''
          )
        )
      : '';

  // columns for the ant.design table
  const columns = [
    { title: 'Code', dataIndex: 'code', width: 170 },
    { title: 'Display', dataIndex: 'display', width: 430 },
    { title: 'Mapped Terms', dataIndex: 'mapped_terms', width: 140 },
    { title: '', dataIndex: 'get_mappings' },
  ];

  // data for each column in the table.
  // Map through the codes in the terminology and display the code, display, number of mapped terms,
  // and an edit or get mappings button depending on the condition.

  const dataSource = terminology?.codes?.map((code, index) => {
    return {
      key: index,
      code: code.code,
      display: code.display,
      mapped_terms: matchCode(code),
      get_mappings:
        /* If the mapping array length is greather than 0, we check if there is a matching mapped code 
to the terminology code. 
              If there is a match for the terminology code in the mapping codes AND if the mappings array for
      that code is > 0, the Edit Mappings button is displayed. On click, a modal with mapping details is opened
    and the terminology code is passed.*/

        mapping?.length > 0 ? (
          mapping.some(m => m.code === code.code && m?.mappings?.length > 0) ? (
            <button
              key={code.code}
              className="manage_term_button"
              onClick={() => setEditMappings(code)}
            >
              Edit Mappings
            </button>
          ) : (
            /* If there is NOT a match for the terminology code in the mapping codes, the Get Mappings button
             is displayed. On click, a modal opens that automatically performs a search in OLS for the terminology 
             code and the terminology code is passed.*/
            <button
              className="manage_term_button"
              onClick={() => setGetMappings(code)}
            >
              Get Mappings
            </button>
          )
        ) : (
          /* If the mapping array length is not greater than 0, the Get Mappings button
             is displayed. On click, a modal opens that automatically performs a search in OLS for the terminology 
             code and the terminology code is passed.*/
          <button
            className="manage_term_button"
            onClick={() => setGetMappings(code)}
          >
            Get Mappings
          </button>
        ),
    };
  });

  // Submit function for the modal to edit the terminology name, description, and url.
  // The function adds the codes to the body of the PUT request to retain the complete
  // terminology object, since only 3 parts (captured in "values" through ant.d functionality) are being edited.
  const handleSubmit = values => {
    handleUpdate(vocabUrl, 'Terminology', terminology, {
      ...values,
      codes: terminology?.codes,
    }).then(data => setTerminology(data));
  };

  return (
    <>
      {/* If page is still loading, display loading spinner. */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="terminology_container">
          <div className="image_container">
            <img className="background_image_results" src={Background} />
          </div>
          <Row gutter={30}>
            <div className="study_details_container">
              <Col span={15}>
                <div className="study_details">
                  <div className="study_name">
                    {/* Displays table name if there is one. If no name, displays DD id */}

                    <h2>
                      {terminology?.name ? terminology?.name : terminology?.id}
                    </h2>
                  </div>
                  <div className="terminology_url">{terminology?.url}</div>

                  <div className="terminology_desc">
                    {/* Displays the DD description if there is one.
                    If there is no description, 'No description provided' is displayed in a gray font */}
                    {terminology?.description ? (
                      terminology?.description
                    ) : (
                      <span className="no_description">
                        No description provided.
                      </span>
                    )}
                  </div>
                </div>
              </Col>
              <Col span={6}>
                <div className="study_details_right">
                  <div className="study_dropdown">
                    {/* ant.design dropdown for edit. */}
                    <SettingsDropdown />
                  </div>
                </div>
              </Col>
            </div>
          </Row>

          <div className="table_container">
            {/* ant.design table with columns */}
            <Table columns={columns} dataSource={dataSource} />
          </div>

          {/* The modals to edit and get mappings with data being passed. */}
          <EditMappingsModal
            editMappings={editMappings}
            setEditMappings={setEditMappings}
            mapping={mapping}
            terminologyId={terminologyId}
            setMapping={setMapping}
          />

          <GetMappingsModal
            terminology={terminology}
            setTerminology={setTerminology}
            getMappings={getMappings}
            setGetMappings={setGetMappings}
            setMapping={setMapping}
            terminologyId={terminologyId}
          />

          {/* Modal to edit details */}
          <Modal
            open={edit}
            width={'51%'}
            onOk={() =>
              form.validateFields().then(values => {
                form.resetFields();
                setEdit(false);
                handleSubmit(values);
              })
            }
            onCancel={() => {
              form.resetFields();
              setEdit(false);
            }}
            maskClosable={false}
            closeIcon={false}
            destroyOnClose={true}
          >
            {/* Displays the edit form */}

            <EditTerminologyDetails form={form} terminology={terminology} />
          </Modal>
        </div>
      )}
    </>
  );
};
