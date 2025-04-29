/*
    Campos:
        Name
        Specialty
        Email 
        Password 
*/

import { Schema, model } from "mongoose";

const doctorSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },

    Specialty: {
      type: String,
    },

    email: {
      type: String,
    },
    Password: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("doctor", doctorSchema);