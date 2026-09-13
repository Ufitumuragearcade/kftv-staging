import http from 'http';

const url = process.argv[2] || 'https://ufitumuragearcade.github.io/kftv-staging/';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Has <div id="root">:', data.includes('id="root"'));
    console.log('Has JS bundle:', data.includes('.js'));
    console.log('Has CSS:', data.includes('.css'));
    
    const jsMatch = data.match(/src="([^"]+\.js)"/);
    const cssMatch = data.match(/href="([^"]+\.css)"/);
    if (jsMatch) console.log('JS file:', jsMatch[1]);
    if (cssMatch) console.log('CSS file:', cssMatch[1]);
  });
}).on('error', (e) => console.log('Error:', e.message));
