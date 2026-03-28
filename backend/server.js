import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001

app.use(cors());

app.get('/api/metrics', (_req, res) => {
  res.json({status: "ok"});
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});