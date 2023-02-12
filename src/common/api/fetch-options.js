const USER_AGENT = 'Prototype Tools for iNaturalist';

export const getFetchOptions = () => {
    return {
        method: 'GET',
        headers: {
            'X-Via': USER_AGENT
        }
    };
};

export const postAuthFetchOptions = (bodyObj, authToken) => {
    return {
        method: 'POST',
        headers: {
            'X-Via': USER_AGENT,
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': authToken
        },
        body: JSON.stringify(bodyObj)
    };
};

export const getAuthFetchOptions = (authToken) => {
    return {
        method: 'GET',
        headers: {
            'X-Via': USER_AGENT,
            'Authorization': authToken
        }
    };
};

export const postFetchOptions = (bodyObj) => {
    return {
        method: 'POST',
        headers: {
            'X-Via': USER_AGENT,
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(bodyObj)
    };
};