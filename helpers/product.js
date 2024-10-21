import http from 'k6/http';
import { check } from 'k6';

export function createProduct(productPayload, BASE_URL, token) {
    const url = `${BASE_URL}/products`; 
    const params = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const response = http.post(url, JSON.stringify(productPayload), {...params, timeout: '30s'});

    console.log(`Creating product with payload: ${JSON.stringify(productPayload)}`);
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Body: ${response.body}`);

    check(response, {
        'product creation successful': (r) => r.status === 201,
        'product response contains expected fields': (r) => r.json('name') !== null && r.json('price') !== null && r.json('user_id') !== null,
    });

    if (response.status !== 201) {
        console.error(`Failed to create product. Status: ${response.status}, Response: ${response.body}`);
    } else {
        console.log(`Product created successfully!`);
    }

    return response; 
}

export function getAllProducts(BASE_URL, token) {
    const url = `${BASE_URL}/products`;
    const params = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const response = http.get(url, params);

    console.log(`Fetching all products for user. Response Status: ${response.status}`);
    console.log(`Response Body: ${response.body}`);

    check(response, {
        'get products successful': (r) => r.status === 200,
    });

    return response;
}
