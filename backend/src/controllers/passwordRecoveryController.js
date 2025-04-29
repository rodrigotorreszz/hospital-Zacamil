import jsonwebtoken from "jsonwebtoken"; //Token
import bcryptjs from "bcryptjs"; //Encriptar

import DoctorModel from "../models/DoctorModel.js";

import { config } from "../config.js";
import { sendMail, HTMLRecoveryEmail } from "../utils/MailPasswordRecovery.js";

//1- Creo un array de funciones
const passwordRecoveryController = {};

passwordRecoveryController.requestCode = async (req, res) => {
  const { Email } = req.body;

  try {
    let userFound;
    let userType;

    // Buscamos si el correo está
    // en la colección de clientes
    userFound = await DoctorModel.findOne({ Email });
    if (userFound) {
      userType = "Doctor";
    }

    // Si no encuentra ni en clientes ni en empleados
    if (!userFound) {
      return res.json({ message: "User not found" });
    }

    // Generar un código aleatorio
    const code = Math.floor(10000 + Math.random() * 90000).toString();

    //Crear un token que guarde todo
    const token = jsonwebtoken.sign(
      //1-¿que voy a guardar?
      { Email, code, userType, verfied: false },
      //2-secret key
      config.JWT.secret,
      //3-¿cuando expira?
      { expiresIn: "20m" }
    );

    res.cookie("tokenRecoveryCode", token, { maxAge: 20 * 60 * 1000 });

    // ULTIMO PASO, enviar el correo
    await sendMail(
      Email,
      "Password recovery code", //Asunto
      `Your verification code is: ${code}`, //Texto
      HTMLRecoveryEmail(code) //
    );

    res.json({ message: "Verification code send" });
  } catch (error) {}
};

passwordRecoveryController.verifyCode = async (req, res) => {
  const { code } = req.body;

  try {
    //Extraer el token de las cookies
    const token = req.cookies.tokenRecoveryCode;

    // Decodificar el token
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    // Verificar que pasa si el código que está guardado
    // en el token, no es el mismo que el usuario escribió
    if (decoded.code !== code) {
      return res.json({ message: "Invalid Code" });
    }

    // Generemos un nuevo token
    const newToken = jsonwebtoken.sign(
      //1-¿que vamos a guardar?
      {
        Email: decoded.Email,
        code: decoded.code,
        userType: decoded.userType,
        verified: true,
      },
      //2- secret key
      config.JWT.secret,
      //3- ¿cuando expira?
      { expiresIn: "20m" }
    );
    res.cookie("tokenRecoveryCode", newToken, { maxAge: 20 * 60 * 1000 });

    res.json({ message: "Code verified successfully" });
  } catch (error) {
    console.log("error" + error);
  }
};

passwordRecoveryController.newPassword = async (req, res) => {
  const { newPassword } = req.body;

  try {
    //1- Extraer el token de las cookies
    const token = req.cookies.tokenRecoveryCode;

    //2- Desglozar lo que tiene el token adentro
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    //3- Accedemos a la variable verified a ver que valor tiene
    if (!decoded.verified) {
      return res.json({ message: "Code not verified, cannot reset password" });
    }

    // Extraer el correo y tipo de usuario del token
    const { Email, userType } = decoded;

    let user;

    // Buscamos al usuario dependiendo del userType
    if (userType === "Doctor") {
      user = await DoctorModel.findOne({ Email });
    } 
    //Encriptar la contraseña nueva
    const hashPassword = await bcryptjs.hash(newPassword, 10);

    // ULTIMO PASO
    // Actualizar la contraseña

    let updatedUser;
    if (userType === "doctor") {
      updatedUser = await DoctorModel.findOneAndUpdate(
        { Email },
        { password: hashPassword },
        { new: true }
      );
    } 

    res.clearCookie("tokenRecoveryCode");

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("error" + error);
  }
};

export default passwordRecoveryController;
