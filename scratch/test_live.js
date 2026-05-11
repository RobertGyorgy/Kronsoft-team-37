const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function testLive() {
  const lineName = '52';
  const stopName = 'Piața Unirii';
  const cleanLine = lineName;
  
  const normalize = (s) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : '';
  const target = normalize(stopName);
  
  const directions = ['dus', 'intors'];
  for (const dir of directions) {
    const url = `https://www.ratbv.ro/afisaje/${cleanLine}-${dir}/div_list_ro.html`;
    try {
      console.log('Fetching', url);
      const res = await axios.get(url);
      const dom = new JSDOM(res.data);
      const document = dom.window.document;
      const links = Array.from(document.querySelectorAll('a'));
      const stopLink = links.find(l => normalize(l.textContent || '').includes(target));
      if (stopLink) {
        console.log('Found stop link:', stopLink.href);
        const stopUrl = `https://www.ratbv.ro/afisaje/${cleanLine}-${dir}/${stopLink.href}`;
        const stopRes = await axios.get(stopUrl);
        const stopDoc = new JSDOM(stopRes.data).window.document;
        stopDoc.querySelectorAll('tr').forEach(r => {
          console.log('Row:', r.textContent.trim().replace(/\s+/g, ' '));
        });
      } else {
        console.log('Stop link not found');
      }
    } catch (e) {
      console.log('Error', url, e.message);
    }
  }
}
testLive();
