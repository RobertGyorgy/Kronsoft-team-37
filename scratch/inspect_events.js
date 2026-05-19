const axios = require('axios');

async function main() {
    try {
        const res = await axios.get('https://zilesinopti.ro/evenimente-brasov/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = res.data;
        
        const index = html.indexOf('steaua-campioana-europei-1986');
        if (index !== -1) {
            console.log('--- SURROUNDING HTML AROUND EVENT 2 ---');
            console.log(html.substring(index - 1000, index + 1000));
        } else {
            console.log('Event 2 string not found.');
        }
    } catch (err) {
        console.error(err);
    }
}
main();
