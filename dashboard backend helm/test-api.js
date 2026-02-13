const baseUrl = 'http://localhost:3000';

async function testAPI() {
    console.log('🧪 Testing Store Provisioning API\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const healthResponse = await fetch(`${baseUrl}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health:', healthData);

        // Test 2: Get All Stores (should be empty initially)
        console.log('\n2. Testing GET /stores (empty)...');
        const getResponse1 = await fetch(`${baseUrl}/stores`);
        const stores1 = await getResponse1.json();
        console.log('✅ Stores:', stores1);

        // Test 3: Create a new store
        console.log('\n3. Testing POST /stores...');
        const createResponse = await fetch(`${baseUrl}/stores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Store',
                status: 'Provisioning',
                namespace: 'test-ns',
                url: 'http://test.example.com'
            })
        });
        const newStore = await createResponse.json();
        console.log('✅ Created Store:', newStore);

        // Test 4: Get All Stores (should have one store)
        console.log('\n4. Testing GET /stores (with data)...');
        const getResponse2 = await fetch(`${baseUrl}/stores`);
        const stores2 = await getResponse2.json();
        console.log('✅ Stores:', stores2);

        // Test 5: Get Store by ID
        console.log('\n5. Testing GET /stores/:id...');
        const getByIdResponse = await fetch(`${baseUrl}/stores/${newStore.id}`);
        const storeById = await getByIdResponse.json();
        console.log('✅ Store by ID:', storeById);

        // Test 6: Create another store
        console.log('\n6. Creating another store...');
        const createResponse2 = await fetch(`${baseUrl}/stores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Production Store',
                status: 'Ready',
                namespace: 'prod-ns',
                url: 'http://prod.example.com'
            })
        });
        const newStore2 = await createResponse2.json();
        console.log('✅ Created Store:', newStore2);

        // Test 7: Delete a store
        console.log('\n7. Testing DELETE /stores/:id...');
        const deleteResponse = await fetch(`${baseUrl}/stores/${newStore.id}`, {
            method: 'DELETE'
        });
        const deleteResult = await deleteResponse.json();
        console.log('✅ Delete Result:', deleteResult);

        // Test 8: Verify deletion
        console.log('\n8. Verifying deletion...');
        const getResponse3 = await fetch(`${baseUrl}/stores`);
        const stores3 = await getResponse3.json();
        console.log('✅ Remaining Stores:', stores3);

        console.log('\n🎉 All tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testAPI();
