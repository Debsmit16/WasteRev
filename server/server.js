import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import healthAnalysisRouter from './api/health-analysis.js';

const app = express();
const port = process.env.PORT || 3000;

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the Dashboard directory
app.use(express.static(path.join(__dirname, '../Dashboard')));

// API routes
app.use('/api/health-analysis', healthAnalysisRouter);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!', details: err.message });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
