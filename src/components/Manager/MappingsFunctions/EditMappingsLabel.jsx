import { useContext } from 'react';
import { MappingContext } from '../../../Contexts/MappingContext';
import { ellipsisString } from '../Utilitiy';
import { MappingRelationship } from './MappingRelationship';
import { Tooltip } from 'antd';

export const EditMappingsLabel = ({ item, index }) => {
  const { showOptions, setShowOptions, relationshipOptions, idsForSelect } =
    useContext(MappingContext);
  // Find the object in relationshipOptions where the code matches the mappings's mapping_relationship
  // If there is a match, return the display. If not, return null.
  const displayRelationship = item => {
    const findDisplay = relationshipOptions.find(
      ro => ro.code === item.mapping_relationship
    );

    return findDisplay ? findDisplay.display : null;
  };

  return (
    <>
      <div key={index} className="modal_search_result">
        <div>
          <div className="modal_term_ontology">
            <div>
              <b>{item?.display}</b>
            </div>
            <div>{item?.code}</div>
            <div
              className={
                !showOptions && item.mapping_relationship
                  ? 'mapping_relationship'
                  : ''
              }
              onClick={e => {
                e.preventDefault();
                setShowOptions(item.mapping_relationship);
              }}
            >
              {item?.mapping_relationship && !showOptions ? (
                displayRelationship(item)
              ) : item.mapping_relationship && !!showOptions ? (
                <MappingRelationship mapping={item} />
              ) : (
                !item.mapping_relationship && (
                  <MappingRelationship mapping={item} />
                )
              )}
            </div>
          </div>
          <div>
            {item?.description?.length > 100 ? (
              <Tooltip
                mouseEnterDelay={0.5}
                title={item?.description}
                placement="topRight"
              >
                {ellipsisString(item?.description, '100')}
              </Tooltip>
            ) : (
              ellipsisString(item?.description, '100')
            )}
          </div>
        </div>
      </div>
    </>
  );
};
