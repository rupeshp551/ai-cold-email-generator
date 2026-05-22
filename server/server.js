import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3001;

connectDB();

app.use(express.json());

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});