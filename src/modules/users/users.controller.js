import * as UserService from "./users.service.js";
import { sendPaginated, sendSuccess } from "../../utils/index.js";

export const getAllUsers = async (req, res) => {
  const { users, pagination } = await UserService.getAllUsers(
    req.validatedQuery,
  );
  sendPaginated(res, {
    message: "Users Retrieved Successfully",
    data: users,
    pagination: pagination,
  });
};

export const getUserById = async (req, res) => {
  const user = await UserService.getUserById(req.validatedParams.id);
  sendSuccess(res, {
    message: "User Retrieved Successfully",
    data: { user },
  });
};

export const updateUserRole = async (req, res) => {
  const user = await UserService.updateUserRole({
    id: req.validatedParams.id,
    role: req.validatedBody.role,
  });
  sendSuccess(res, {
    message: "User Role Updated Successfully",
    data: { user },
  });
};

export const deleteUser = async (req, res) => {
  await UserService.deleteUser(req.validatedParams.id);
  sendSuccess(res, {
    message: "Account Deleted Successfully",
  });
};
