import { notification } from 'antd';
import { cleanedName } from '../Utilitiy';

export const OntologyFilterCodeSubmit = (
  apiPreferencesCode,
  preferenceType,
  prefTypeKey,
  mappingProp,
  vocabUrl,
  table
) => {
  const apiPreference = {
    api_preference: { 'ols': [] },
  };
  if (
    apiPreferencesCode &&
    JSON.stringify(
      Object.values(preferenceType[prefTypeKey]?.api_preference)[0]?.sort()
    ) !== JSON.stringify(apiPreferencesCode?.sort())
  ) {
    apiPreference.api_preference.ols = apiPreferencesCode;

    fetch(`${vocabUrl}/Table/${table.id}/filter/${mappingProp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPreference),
    })
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

export const OntologyFilterCodeSubmitTerm = (
  apiPreferencesCode,
  preferenceType,
  prefTypeKey,
  searchProp,
  vocabUrl,
  terminology
) => {
  const apiPreference = {
    api_preference: { 'ols': [] },
  };
  if (
    apiPreferencesCode &&
    JSON.stringify(
      Object.values(preferenceType[prefTypeKey]?.api_preference)[0]?.sort()
    ) !== JSON.stringify(apiPreferencesCode?.sort())
  ) {
    apiPreference.api_preference.ols = apiPreferencesCode;

    fetch(`${vocabUrl}/Terminology/${terminology.id}/filter/${searchProp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPreference),
    })
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
