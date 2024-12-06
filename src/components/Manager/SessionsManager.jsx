export const startSession = (vocabUrl, email) => {
    const body = {
        "user_id": email,
        "affiliation": "affiliation"
    }
    return fetch(`${vocabUrl}/session/start`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(async res => {
        if (res.ok) {
            const data = await res.json();
            console.log(data, 'Session Successful');
            return res.json();
        } else if (res.status === 401) {
            navigate('/login');
        } else {
            return res.json().then(error => {
                throw new Error(error);
            });
        }
    });
};

export const endSession = (vocabUrl) => {
    return fetch(`${vocabUrl}/session/terminate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(async res => {
        if (res.ok) {
            const data = await res.json();
            console.log(data, 'Session Ended');
            return res.json();
        } else {
            return res.json().then(error => {
                throw new Error(error);
            });
        }
    });

}

export const getSessionStatus = (vocabUrl) => {
    return fetch(`${vocabUrl}/session/terminate`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(async res => {
        if (res.ok) {
            const data = await res.json();
            console.log(data, 'Session Info');
            return res.json();
        } else {
            return res.json().then(error => {
                throw new Error(error);
            });
        }
    });

}


