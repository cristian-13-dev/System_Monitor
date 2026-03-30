import express from 'express';
import cors from 'cors';
import { startCpuMetricsPolling } from "./services/cpu.service.js";
import { startMemoryMetricsPolling } from "./services/memory.service.js";
import cpuRoute from "./routes/cpu.routes.js";
import memoryRoute from "./routes/memory.route.js";

const app = express();
const port = 3001

app.use(cors());
app.use('/api', cpuRoute, memoryRoute)

async function bootstrap(): Promise<void> {
  await startCpuMetricsPolling();
  await startMemoryMetricsPolling()

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

void bootstrap();