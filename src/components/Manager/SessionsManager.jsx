export const startSession = (vocabUrl, email) => {  
  const body = {
    'user_id': email,
    // 'affiliation': 'affiliation',
  };
  return fetch(`${vocabUrl}/session/start`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(async res => {
    const data = await res.json();
    if (res.ok) {
      console.log(data.message);
      return data;
    } else {
      throw new Error(data.message || 'Unknown error occurred'); 
    }
  });
};

export const endSession = vocabUrl => {  
  return fetch(`${vocabUrl}/session/terminate`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(async res => {
    const data = await res.json();
    if (res.ok) {
      console.log(data.message,'ended');
      
      return data;
    } else {
      throw new Error(data.message || 'Unknown error occurred'); 
    }
  });
};

export const getSessionStatus = vocabUrl => {
  return fetch(`${vocabUrl}/session/status`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  }).then(async res => {
    const data = await res.json();
    if (res.ok) {
      console.log(data.message);
      return data;
    } else {
      throw new Error(data.message || 'Unknown error occurred'); 
    }
  });
};
