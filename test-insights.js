import axios from 'axios';

async function run() {
  try {
    const res = await axios.post('http://localhost:3002/api/ai/gemini', {
      action: 'health',
      payload: {
        url: 'x.com'
      }
    }, {
      headers: {
        Cookie: 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtbTg0cWUyNTAwMDBpNXBvNXhhYTFxbXUiLCJlbWFpbCI6InRlc3RjdXJsOTlAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzIzOTI1MzAsImV4cCI6MTc3Mjk5NzMzMH0.NO0GbMK2C3ucGbvE6IeSpB33lzMzWh_cqu8FxWcRYSc'
      }
    });
    console.log("SUCCESS:");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("FAIL:", err.response?.data || err.message);
  }
}
run();
