import * as UserService from "./users.service.js";
import { sendSuccess } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

export const createUser = async (req, res) => {
  const newUser = await UserService.createUser(req.validatedBody);
  sendSuccess(res, { data: newUser, statusCode: HTTP_STATUS.CREATED });
};

export const loginUser = async (req, res) => {
  const token = await UserService.loginUser(req.validatedBody);
  sendSuccess(res, { data: token });
};
