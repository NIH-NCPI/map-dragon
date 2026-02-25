import { Button } from 'antd';
import { useContext } from 'react';
import { SearchContext } from '../../../Contexts/SearchContext';

export const MappingButton = ({
  variable,
  setGetMappings,
  setAssignMappingsViaButton
}) => {
  const { prefTerminologies } = useContext(SearchContext);

  const handleClick = () => {
    if (prefTerminologies?.length > 0) {
      setAssignMappingsViaButton({
        display: variable?.name ? variable?.name : variable?.display,
        code: variable.code
      });
    } else {
      setGetMappings({
        name: variable?.name ? variable?.name : variable?.display,
        code: variable?.code
      });
    }
  };

  return (
    <div className="no_mapping_button">
      <Button onClick={handleClick}>
        {prefTerminologies?.length > 0 ? 'Assign Mappings' : 'Get Mappings'}
      </Button>
    </div>
  );
};
