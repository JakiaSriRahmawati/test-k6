import http from 'k6/http';
import { check } from 'k6';

export function registerUser(userData, url) {
    const response = http.post(`${url}/register`, JSON.stringify(userData), {
        headers: { 'Content-Type': 'application/json' },
    });

    check(response, {
        'registration successful': (r) => r.status === 201,
    });

    return response; 
}

export function loginUser(body, BASE_URL) {
    const loginResponse = http.post(`${BASE_URL}/login`, JSON.stringify(body), {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });

    check(loginResponse, {
        'login response status must be 200': (response) => response.status === 200,
        'login response must contain token': (response) => response.json('token') !== null,
    });

    return loginResponse;
}
