import { registerUser } from './helpers/user.js';
import { Counter } from 'k6/metrics';
import { sleep } from 'k6';

const BASE_URL = 'http://127.0.0.1:8000/api';

export const options = {
    scenarios: {
        registration_test: { 
            executor: 'constant-vus',
            vus: 10,          
            duration: '4s',   
        },
    },
    thresholds: {
        registration_success: ['count>8'],  
        registration_error: ['count<10'],   
    },
};

const registerCounterSuccess = new Counter("registration_success");
const registerCounterError = new Counter("registration_error");

export default function () {
    const timestamp = new Date().getTime();
    const uniqueEmail = `user${__VU}_${timestamp}@example.com`; 
    const userData = {
        name: "User " + __VU,
        email: uniqueEmail,
        password: "rahasia123",
        password_confirmation: "rahasia123"
    };

    const response = registerUser(userData, BASE_URL); 
    
    if (response.status === 201) { 
        registerCounterSuccess.add(1); 
    } else {
        registerCounterError.add(1); 
        console.error(`Failed to register user: ${response.status} ${response.body}`); 
    }

    sleep(1); 
}
