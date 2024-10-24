import { notification } from 'antd';

export const OntologyFilterCodeSubmit = (
  apiPreferencesCode,
  setApiPreferencesCode,
  apiPreferences,
  mappingProp,
  table,
  vocabUrl,
  component
) => {
  const apiPreference = {
    api_preference: { 'ols': [] },
  };

  if (
    apiPreferencesCode &&
    JSON.stringify(
      Object.values(apiPreferences?.self?.api_preference)[0].sort()
    ) !== JSON.stringify(apiPreferencesCode?.sort())
  ) {
    apiPreference.api_preference.ols = apiPreferencesCode;

    fetch(
      `${vocabUrl}/${(component = table
        ? table?.terminology?.reference
        : `Terminology/${component?.id}`)}/filter/${mappingProp}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPreference),
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
            description: 'An error occurred saving the ontology preferences.',
          });
        }
        return error;
      });
  }
};
