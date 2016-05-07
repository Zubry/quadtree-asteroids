import express from 'express';
import path from 'path';

const app = express();

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/public/index.html`));
});

app.use(express.static(`${__dirname}/public`));

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
