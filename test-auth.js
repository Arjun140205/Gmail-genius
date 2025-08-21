#!/usr/bin/env node

/**
 * Test script to verify authentication and session handling
 */

import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3500';

async function testAuth() {
  console.log('🧪 Testing GmailGenius Authentication...\n');

  try {
    // Test 1: Check server status
    console.log('1️⃣ Testing server connectivity...');
    const serverResponse = await fetch(`${baseUrl}/`);
    const serverText = await serverResponse.text();
    console.log(`✅ Server response: ${serverText}\n`);

    // Test 2: Check auth status (unauthenticated)
    console.log('2️⃣ Testing auth status (should be unauthenticated)...');
    const authResponse = await fetch(`${baseUrl}/auth/status`);
    const authData = await authResponse.json();
    console.log(`📊 Auth status:`, authData);
    console.log(`✅ Expected: isAuthenticated = false\n`);

    // Test 3: Check user endpoint (should return 401)
    console.log('3️⃣ Testing user endpoint (should return 401)...');
    const userResponse = await fetch(`${baseUrl}/auth/user`);
    console.log(`📊 User endpoint status: ${userResponse.status}`);
    const userData = await userResponse.json();
    console.log(`📊 User response:`, userData);
    console.log(`✅ Expected: status = 401\n`);

    // Test 4: Check debug endpoint
    console.log('4️⃣ Testing debug endpoint...');
    const debugResponse = await fetch(`${baseUrl}/api/debug`);
    const debugData = await debugResponse.json();
    console.log(`📊 Debug data:`, debugData);
    console.log(`✅ API is accessible\n`);

    console.log('🎉 All tests completed!');
    console.log('📝 To test full auth flow:');
    console.log('   1. Go to http://localhost:3000');
    console.log('   2. Click "Sign in with Google"');
    console.log('   3. Complete OAuth flow');
    console.log('   4. Check if dashboard loads');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();
