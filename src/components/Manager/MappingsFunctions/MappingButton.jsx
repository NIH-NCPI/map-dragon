import { Button, message, notification, Spin } from 'antd';
import { useContext, useState } from 'react';
import { SearchContext } from '../../../Contexts/SearchContext';
import { myContext } from '../../../App';
import { uriEncoded } from '../Utility';
import { MappingContext } from '../../../Contexts/MappingContext';
import { SmallSpinner } from '../Spinner';

export const MappingButton = ({
  variable,
  setGetMappings,
  setAssignMappingsViaButton,
  component,
  componentString
}) => {
  const { prefTerminologies } = useContext(SearchContext);
  const { vocabUrl, user } = useContext(myContext);
  const { setMapping } = useContext(MappingContext);
  const [loading, setLoading] = useState(false);

  const handleClick = e => {
    e.stopPropagation();
    if (prefTerminologies?.length > 0) {
      setAssignMappingsViaButton({
        display: variable?.name ? variable?.name : variable?.display,
        code: variable.code,
        description: variable?.description
      });
    } else {
      setGetMappings({
        name: variable?.name ? variable?.name : variable?.display,
        code: variable?.code,
        description: variable?.description
      });
    }
  };

  const mapNone = e => {
    e.stopPropagation();
    const mappingsDTO = {
      mappings: [
        {
          code: 'NoMappingRequired',
          display: 'No Mapping Required',
          description: '',
          system: 'https://freethedata.org/terms/null-flavor'
        }
      ],
      editor: user.email
    };

    setLoading(true);
    fetch(
      `${vocabUrl}/${componentString}/${component.id}/mapping/${uriEncoded(
        variable?.code
      )}?user_input=true&user=${user?.email}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mappingsDTO)
      }
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => {
        setMapping(data.codes);
        message.success('Mapping saved');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred saving the mapping.'
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  };
  return (
    <div className="no_mapping_button">
      <Button disabled={loading} onClick={e => handleClick(e)}>
        Mappings
      </Button>
      {loading ? (
        <div className="no_mapping_spinner">
          <Spin />
        </div>
      ) : (
        <Button className="none_required" onClick={e => mapNone(e)}>
          No Mapping Required
        </Button>
      )}
    </div>
  );
};
