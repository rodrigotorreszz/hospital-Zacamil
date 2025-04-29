import DoctorModel from "../models/DoctorModel.js";
import bcryptjs from "bcryptjs"; //para encriptar
import jsonwebtoken from "jsonwebtoken"; //para generar token
import { config } from "../config.js";

const registerDoctorsController = {};

registerDoctorsController.register = async (req, res) => {
  const {
    name,
    Specialty,
    Email,
    Password 
    
  } = req.body;

  try {
    const existDoctor = await DoctorModel.findOne({ Email });
    if (existDoctor) {
      return res.json({ message: "Doctor ya existe" });
    }

    // Encriptar la contraseña
    const passwordHash = await bcryptjs.hash(Password, 10);

    // Guardemos el empleado nuevo
    const newDoctor = new DoctorModel({
        name,
        Specialty,
        Email,
        Password: passwordHash
    });

    await newDoctor.save();

    // --> TOKEN <--
    jsonwebtoken.sign(
      //1-Que voy a guardar
      { id: newDoctor._id },
      //2-secreto
      config.JWT.secret,
      //3- cuando expira
      { expiresIn: config.JWT.expiresIn },
      //4- funcion flecha
      (error, token) => {
        if (error) console.log(error);
        res.cookie("authToken", token);
        res.json({message: "Doctor registrado"})
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export default registerDoctorsController;