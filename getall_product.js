import { registerUser, loginUser } from './helpers/user.js';
import { Counter } from 'k6/metrics';
import { createProduct, getAllProducts } from './helpers/product.js';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE_URL = 'http://127.0.0.1:8000/api';

export const options = {
    scenarios: {
        createProductExec: {
            exec: "createProductExec",
            executor: "constant-vus",
            vus: 10, 
            duration: '1m30s',
        },
    },
    thresholds: {
        user_login_counter_success: ['count>8'],
        user_login_counter_error: ['count<10'],
        user_registration_counter_success: ['count>8'],
        user_registration_counter_error: ['count<10'],
        product_creation_counter_success: ['count>8'], 
        product_creation_counter_error: ['count<10'],
    },
};

const registerCounterSuccess = new Counter("user_registration_counter_success");
const registerCounterError = new Counter("user_registration_counter_error");
const loginCounterSuccess = new Counter("user_login_counter_success");
const loginCounterError = new Counter("user_login_counter_error");
const productCreationCounterSuccess = new Counter("product_creation_counter_success");
const productCreationCounterError = new Counter("product_creation_counter_error");

export function createProductExec() {
    const uniqueId = uuidv4();
    const email = `jek-${uniqueId}@example.com`;
    
    const registerRequest = {
        name: `jek-${uniqueId}`,
        email: email,
        password: '12345678',
        password_confirmation: '12345678',
    };

    const registerResponse = registerUser(registerRequest, BASE_URL);
    if (registerResponse && registerResponse.status === 201) {
        registerCounterSuccess.add(1);
    } else {
        registerCounterError.add(1);
        console.error(`User registration failed for email: ${email}`);
        return; 
    }

    const loginRequest = {
        email: email,
        password: '12345678',
    };

    const loginResponse = loginUser(loginRequest, BASE_URL);
    if (loginResponse && loginResponse.status === 200) {
        loginCounterSuccess.add(1);
        const token = loginResponse.json().token; 
        const userId = loginResponse.json().id;  

        for (let i = 1; i <= 3; i++) {
            const productPayload = {
                user_id: userId, 
                name: `mouse-${uniqueId}-${i}`, 
                price: Math.floor(Math.random() * 100), 
            };

            const productResponse = createProduct(productPayload, BASE_URL, token); 
            if (productResponse && productResponse.status === 201) {
                productCreationCounterSuccess.add(1);
            } else {
                productCreationCounterError.add(1);
                console.error(`Failed to create product for user: ${email}`);
            }
        }

        const allProductsResponse = getAllProducts(BASE_URL, token);
        if (allProductsResponse && allProductsResponse.status === 200) {
            console.log(`All products fetched successfully for user: ${email}`);
        } else {
            console.error(`Failed to fetch products for user: ${email}`);
        }

    } else {
        loginCounterError.add(1);
        console.error(`User login failed for email: ${email}`);
    }
}
