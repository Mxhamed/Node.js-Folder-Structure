import * as UserService from "./users.service.js";
import { HTTP_STATUS } from "../../constants/index.js";
import { sendSuccess } from "../../utils/index.js";

export const createUser = async (req, res) => {
  const newUser = await UserService.createUser(req.validatedBody);
  sendSuccess(res, { data: newUser, statusCode: HTTP_STATUS.CREATED });
};

export const loginUser = async (req, res) => {
  const token = await UserService.loginUser(req.validatedBody);
  sendSuccess(res, { data: token });
};
