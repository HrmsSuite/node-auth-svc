import express from "express";
import router from "./routes/index.js";
import dotenv from "dotenv";
import { mongoDB } from "./DB/connect.js";
import cors from "cors";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(router);

mongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});