const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function run() {
  const form = new FormData();
  form.append('file', Buffer.from('hello world'), 'hello.txt');

  try {
    // We don't have authentication, so it might fail with 401. But let's see.
    const res = await axios.post('http://localhost:3001/documents', form, {
      headers: form.getHeaders(),
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
run();
