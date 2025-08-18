import { getById } from '../FetchManager';
import { uriEncoded } from '../Utility';

export const mappingVotes = (
  variableMappings,
  code,
  user,
  vote,
  vocabUrl,
  componentId,
  notification,
  setMapping,
  component
) => {
  const mappingVoteDTO = {
    vote: vote,
  };

  return fetch(
    `${vocabUrl}/${component}/${componentId}/user_input/${uriEncoded(
      variableMappings?.code
    )}/mapping/${uriEncoded(code?.code)}/mapping_votes`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mappingVoteDTO),
    }
  )
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error('An unknown error occurred.');
      }
    })
    .catch(error => {
      if (error) {
        notification.error({
          message: 'Error',
          description: 'An error occurred saving the vote.',
        });
      }
      return error;
    })
    .then(() =>
      getById(
        vocabUrl,
        component,
        `${componentId}/mapping?user_input=True&user=${user?.email}`
      )
        .then(data => setMapping(data.codes))
        .catch(error => {
          if (error) {
            notification.error({
              message: 'Error',
              description: 'An error occurred loading mappings.',
            });
          }
          return error;
        })
    );
};
