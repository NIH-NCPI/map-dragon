import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { myContext } from '../../../App';
import './Terminology.scss';
import { Spinner } from '../../Manager/Spinner';
import { getById } from '../../Manager/FetchManager';
import { Col, Form, Input, notification, Row, Table, Tooltip } from 'antd';

import { EditMappingsModal } from './EditMappingModal';
import { GetMappingsModal } from './GetMappingsModal';
import { EditTerminologyDetails } from './EditTerminologyDetails';
import { SettingsDropdownTerminology } from '../../Manager/Dropdown/SettingsDropdownTerminology';
import { ClearMappings } from './ClearMappings';
import { AddCode } from './AddCode';
import { EditCode } from './EditCode';
import { MappingContext } from '../../../MappingContext';

export const Terminology = () => {
  const [form] = Form.useForm();

  const { terminologyId } = useParams();
  const { vocabUrl } = useContext(myContext);
  const {
    editMappings,
    setEditMappings,
    getMappings,
    setGetMappings,
    mapping,
    setMapping,
  } = useContext(MappingContext);

  const [loading, setLoading] = useState(true);
  const initialTerminology = { url: '', description: '', name: '', codes: [] }; //initial state of terminology
  const [terminology, setTerminology] = useState(initialTerminology);
  const [editRow, setEditRow] = useState(null);
  /* The terminology may have numerous codes. The API call to fetch the mappings returns all mappings for the terminology.
The codes in the mappings need to be matched up to each code in the terminology.
The function maps through the mapping array. For each code, if the mapping code is equal to the 
code in the terminology, AND the mappings array length for the code is > 0, the mappings array is mapped through
and returns the length of the mapping array (i.e. returns the number of codes mapped to the terminology code). 
There is then a tooltip that displays the codes on hover.*/
  const matchCode = code =>
    mapping?.length > 0 &&
    mapping?.map(
      (item, index) =>
        item.code === code.code &&
        item?.mappings?.length > 0 && (
          <Tooltip
            title={item.mappings.map(code => {
              return <div key={index}>{code.code}</div>;
            })}
            key={index}
          >
            {item.mappings.length}
          </Tooltip>
        )
    );

  // data for each column in the table.
  // Map through the codes in the terminology and display the code, display, number of mapped terms,
  // and an edit or get mappings button depending on the condition.
  const tableData = terminology => {
    return terminology?.codes?.map((code, index) => {
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
            mapping.some(
              m => m.code === code.code && m?.mappings?.length > 0
            ) ? (
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
        delete_column: '',
      };
    });
  };

  const [dataSource, setDataSource] = useState(tableData);

  useEffect(() => {
    setDataSource(tableData(terminology));
  }, [terminology, mapping]);

  // Fetches the terminology using the terminologyId param and sets 'terminology' to the response.
  // Fetches the mappings for the terminology and sets the response to 'mapping'
  // Sets loading to false
  useEffect(() => {
    setLoading(true);
    getById(vocabUrl, 'Terminology', terminologyId)
      .then(data => setTerminology(data))
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred loading the Terminology. Please try again.',
          });
        }
        return error;
      });
    getById(vocabUrl, 'Terminology', `${terminologyId}/mapping`)
      .then(data => setMapping(data.codes))
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred loading mappings. Please try again.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  }, []);

  // columns for the ant.design table
  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      width: 180,
      render: (text, tableData) => {
        if (editRow === tableData.key) {
          return (
            <Form.Item
              name="code"
              rules={[{ required: true, message: 'Please enter code name.' }]}
            >
              <Input />
            </Form.Item>
          );
        } else {
          return <p>{text}</p>;
        }
      },
    },
    {
      title: 'Display',
      dataIndex: 'display',
      width: 460,
      render: (text, tableData) => {
        if (editRow === tableData.key) {
          return (
            <Form.Item
              name="display"
              rules={[
                { required: true, message: 'Please enter code display.' },
              ]}
            >
              <Input />
            </Form.Item>
          );
        } else {
          return <p>{text}</p>;
        }
      },
    },
    { title: 'Mapped Terms', dataIndex: 'mapped_terms', width: 90 },
    { title: '', dataIndex: 'get_mappings' },
    {
      title: '',
      dataIndex: 'delete_column',
      render: (_, tableData) => {
        return (
          <>
            {tableData.key !== 'newRow' && (
              // If the tableData key is not "newRow" (i.e. it is not a newly added input field to add a new row)
              // The code and delete buttons are displayed with edit/delete functionality
              <>
                <div className="edit_delete_buttons">
                  <EditCode
                    editRow={editRow}
                    setEditRow={setEditRow}
                    terminology={terminology}
                    setTerminology={setTerminology}
                    tableData={tableData}
                    form={form}
                    dataSource={dataSource}
                    setDataSource={setDataSource}
                    loading={loading}
                    setLoading={setLoading}
                  />
                </div>
              </>
            )}
          </>
        );
      },
    },
  ];

  return (
    <>
      {/* If page is still loading, display loading spinner. */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="terminology_container">
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
                    <SettingsDropdownTerminology />
                  </div>
                </div>
              </Col>
            </div>
          </Row>
          <div className="table_container">
            <AddCode
              terminology={terminology}
              setTerminology={setTerminology}
              dataSource={dataSource}
              setDataSource={setDataSource}
            />

            {/* ant.design table with columns */}
            {loading ? (
              <Spinner />
            ) : (
              <Form form={form}>
                <Table columns={columns} dataSource={dataSource} />
              </Form>
            )}
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

          {/* Displays the edit form */}
          <EditTerminologyDetails
            form={form}
            terminology={terminology}
            setTerminology={setTerminology}
          />
          <ClearMappings terminologyId={terminologyId} />
        </div>
      )}
    </>
  );
};
