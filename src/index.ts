import express from "express";
import router from "./routes/index.js";
import dotenv from "dotenv";
import { mongoDB } from "./DB/connect.js";
import cors from "cors";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = [
  "http://localhost:5173",
  "https://hrms-suite.netlify.app", 
  "https://dev-hrms-suite.vercel.app/", 
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header (e.g. Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(router);

mongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
