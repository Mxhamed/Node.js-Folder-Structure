import { Router } from "express";
import * as UserController from "./users.controller.js";

const router = Router();

router.get("/", UserController.getAllUsers);
router.post("/", UserController.createUser);
router.get("/:id", UserController.getUserById);
router.patch("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

export default router;
