import express from 'express';
import cors from 'cors';
import adminRoutes from './routes/adminRoutes';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Main API Routes
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
