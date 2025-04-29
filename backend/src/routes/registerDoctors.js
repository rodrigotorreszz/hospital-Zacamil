import express from "express";
import registerDoctorsController from "../controllers/registerDoctorsController.js";
const router = express.Router();

router.route("/").post(registerDoctorsController.register)

export default router;