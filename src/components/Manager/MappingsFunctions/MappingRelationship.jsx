import { Select } from 'antd';
import { useContext, useEffect, useRef } from 'react';
import { MappingContext } from '../../../Contexts/MappingContext';

export const MappingRelationship = ({ mapping, variable }) => {
  const { relationshipOptions, idsForSelect, setIdsForSelect } =
    useContext(MappingContext);

  const fontRef = useRef(null);

  const handleSelectChange = (code, value) => {
    setIdsForSelect(prev => {
      return {
        ...prev,
        [code]: value
      };
    });
  };

  const addInfo = str => {
    const label = mapping.display ? mapping.display : mapping.code;
    //Gets with of modal (70% of screen size)
    const modalWidth = document.body.clientWidth * 0.7;
    //Subtracts padding, etc. from modal width to get available width to use for label

    const availableWidth = modalWidth - 390;

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

  const titleHover = str => {
    const label = mapping.display ? mapping.display : mapping.code;

    const result =
      str.includes('Target') && str.includes('Source')
        ? str.replace('Source', variable).replace('Target', label)
        : variable + ' is ' + str + ' to ' + label;
    return variable?.length + label?.length > 84 && result;
  };

  const options = relationshipOptions.map(ro => {
    return {
      value: ro.code,
      label: addInfo(ro.display),
      title: titleHover(ro.display)
    };
  });

  return (
    <Select
      options={options}
      defaultValue={mapping?.mapping_relationship || undefined}
      style={{
        width: 'fit-content'
      }}
      placeholder="Relationship"
      popupMatchSelectWidth={false}
      allowClear
      value={idsForSelect[mapping.code || mapping.code]}
      onChange={value =>
        handleSelectChange(mapping.code || mapping.code, value)
      }
      onClick={e => e.preventDefault()}
    />
  );
};
