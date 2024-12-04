export const mappingVotes = (
  variableMappings,
  code,
  user,
  vote,
  vocabUrl,
  terminologyId,
  notification
) => {
  const mappingVoteDTO = {
    editor: user?.email,
    vote: vote,
  };

  return fetch(
    `${vocabUrl}/Terminology/${terminologyId}/user_input/${variableMappings?.code}/mapping/${code?.code}/mapping_votes`,
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
    });
};
