import express from 'express';
import cors from 'cors';
import metricsRoutes from "./routes/metrics.routes.js";

const app = express();
const port = 3001

app.use(cors());
app.use('/api', metricsRoutes)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});