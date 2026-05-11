const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function testLive() {
  const url = `https://www.ratbv.ro/afisaje/52-dus/line_52_17_cl2_ro.html`;
  try {
    const res = await axios.get(url);
    console.log(res.data.substring(0, 1000));
  } catch (e) {
    console.log(e.message);
  }
}
testLive();
