import express from "express";
import registerDoctorRoutes from "./src/routes/registerDoctors.js";
import passwordRecoveryRoutes from "./src/routes/passwordRecovery.js";
import cookieParser from "cookie-parser";

const app = express();
//Que acepte datos en json
app.use(express.json());
//Que acepte cookies en postman
app.use(cookieParser());
// Definir las rutas de las funciones que tendrá la página web

app.use("/api/registerDoctors", registerDoctorRoutes);
app.use("/api/passwordRecovery", passwordRecoveryRoutes);

export default app;