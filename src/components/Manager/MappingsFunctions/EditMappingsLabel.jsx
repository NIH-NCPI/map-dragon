import { useContext, useRef } from 'react';
import { MappingContext } from '../../../Contexts/MappingContext';
import { ellipsisString } from '../Utility';
import { MappingRelationship } from './MappingRelationship';
import { Tooltip } from 'antd';

export const EditMappingsLabel = ({ item, index, variable }) => {
  const { showOptions, setShowOptions, relationshipOptions, idsForSelect } =
    useContext(MappingContext);
  const fontRef = useRef(null);

  // Find the object in relationshipOptions where the code matches the mappings's mapping_relationship
  // If there is a match, return the display. If not, return null.
  const displayRelationship = item => {
    const findDisplay = relationshipOptions.find(
      ro => ro.code === item.mapping_relationship
    );

    return findDisplay ? addInfo(findDisplay.display) : null;
  };

  const titleHover = str => {
    const label = item.display ? item.display : item.code;

    const result =
      str.includes('Target') && str.includes('Source')
        ? str.replace('Source', variable).replace('Target', label)
        : variable + ' is ' + str + ' to ' + label;
    return variable?.length + label?.length > 110 && result;
  };

  const titleHoverDisplay = item => {
    const findDisplay = relationshipOptions.find(
      ro => ro.code === item.mapping_relationship
    );

    return findDisplay ? titleHover(findDisplay.display) : null;
  };
  const addInfo = str => {
    const label = item.display ? item.display : item.code;
    //Gets with of modal (60% of screen size)
    const modalWidth = document.body.clientWidth * 0.6;
    //Subtracts padding, etc. from modal width to get available width to use for label
    const availableWidth = modalWidth - 120;
    //Gets font from DOM or falls back to specified font if unable to get font from DOM to accurately size the label
    const font = fontRef.current
      ? getComputedStyle(fontRef?.current).font
      : '14px sans-serif';
    //Creates a 2D model of the screen to measure pixels of the label with the string inside (in measureText)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = font;

    const middleText =
      str.includes('Target') && str.includes('Source')
        ? str.replace('Source', '').replace('Target', '').trim()
        : 'is ' + str + ' to';

    //Splits up the label into various portions and measures the width in pixels of each part of the label
    const middleWidth = ctx.measureText(middleText).width;
    const remainingWidth = availableWidth - middleWidth;
    const variableWidth = ctx.measureText(variable).width;
    const labelWidth = ctx.measureText(label).width;

    let variableMaxWidth, labelMaxWidth;
    //If both variable and label fit inside their allotted width, no truncation is necessary
    if (variableWidth + labelWidth <= remainingWidth) {
      variableMaxWidth = variableWidth;
      labelMaxWidth = labelWidth;
      //If variable width is less than half the width of the allotted space, it gives the label more space
    } else if (variableWidth <= remainingWidth * 0.5) {
      variableMaxWidth = variableWidth;
      labelMaxWidth = remainingWidth - variableWidth;
      //If label width is less than half the width of the allotted space, it gives the variable more space
    } else if (labelWidth <= remainingWidth * 0.5) {
      labelMaxWidth = labelWidth;
      variableMaxWidth = remainingWidth - labelWidth;
    } else {
      //If both are long, it splits them evenly
      variableMaxWidth = remainingWidth * 0.5;
      labelMaxWidth = remainingWidth * 0.5;
    }
    const truncate = (text, maxWidth) => {
      //If the text already fits inside its allotted width, returns it as is.
      if (ctx.measureText(text).width <= maxWidth) return text;
      let truncated = text;
      // Otherwise, slices one character at a time from the end until the text + "..." fits inside the alloted space
      while (
        ctx.measureText(truncated + '...').width > maxWidth &&
        truncated.length > 0
      ) {
        truncated = truncated.slice(0, -1);
      }
      return truncated + '...';
    };

    const truncatedVariable = truncate(variable, variableMaxWidth);
    const truncatedLabel = truncate(label, labelMaxWidth);
    //Places the truncated variables and labels into the string
    return str.includes('Target') && str.includes('Source')
      ? str
          .replace('Source', truncatedVariable)
          .replace('Target', truncatedLabel)
      : truncatedVariable + ' is ' + str + ' to ' + truncatedLabel;
  };

  return (
    <>
      <div key={index} className="modal_search_result">
        <div>
          <div className="modal_term_ontology">
            <div ref={fontRef}>
              <b>{item?.display}</b>
            </div>
            <div>{item?.ftd_code}</div>
          </div>
          <div
            title={titleHoverDisplay(item)}
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
              <MappingRelationship
                mapping={item}
                variable={variable}
                editSearch={null}
              />
            ) : (
              !item.mapping_relationship && (
                <MappingRelationship
                  mapping={item}
                  variable={variable}
                  editSearch={null}
                />
              )
            )}
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
