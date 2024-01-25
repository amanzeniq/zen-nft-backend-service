import Joi from "joi";

const addressSchema = Joi.string()
  .regex(/^0x[a-fA-F0-9]{40}$/)
  .required();

export { addressSchema };
