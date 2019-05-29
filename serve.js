const express = require('express');

const app = express();
const http = require('http').Server(app);

app.use('/css', express.static(`${__dirname}/css`));
app.use('/img', express.static(`${__dirname}/img`));
app.use('/js', express.static(`${__dirname}/js`));
app.use('/res', express.static(`${__dirname}/res`));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

http.listen(8080, () => {
  console.log('Listening on *:8080');
});
