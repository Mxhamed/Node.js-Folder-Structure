import { Router } from "express";
import * as UserValidation from "./users.validators.js";
import * as UserController from "./users.controller.js";
import { USER_ROLES } from "../../constants/index.js";
import {
  authenticate,
  authorize,
  validateParams,
  validateBody,
  validateQuery,
} from "../../middleware/index.js";

const router = Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));

router.get(
  "/",
  validateQuery(UserValidation.getALlUsersSchema),
  UserController.getAllUsers,
);

router.get(
  "/:id",
  validateParams(UserValidation.userIdSchema),
  UserController.getUserById,
);

router.patch(
  "/:id/role",
  validateParams(UserValidation.userIdSchema),
  validateBody(UserValidation.updateRoleSchema),
  UserController.updateUserRole,
);

router.delete(
  "/:id",
  validateParams(UserValidation.userIdSchema),
  UserController.deleteUser,
);

export default router;
