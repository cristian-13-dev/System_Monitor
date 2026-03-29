import express from 'express';
import cors from 'cors';
import { startCpuMetricsPolling } from "./services/cpu.service.js";
import cpuRoutes from "./routes/cpu.routes.js";

const app = express();
const port = 3001

app.use(cors());
app.use('/api', cpuRoutes)

async function bootstrap(): Promise<void> {
  await startCpuMetricsPolling();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

void bootstrap();