import { notification } from 'antd';

export const OntologyFilterCodeSubmit = (
  apiPreferencesCode,
  setApiPreferencesCode,
  apiPreferences,
  mappingProp,
  table,
  vocabUrl
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
      `${vocabUrl}/${table?.terminology?.reference}/filter/${mappingProp}`,
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
      .then(() =>
        fetch(
          `${vocabUrl}/${table?.terminology?.reference}/filter/${mappingProp}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => {
        setApiPreferencesCode(data);
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
