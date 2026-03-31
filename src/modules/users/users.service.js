import { User } from "../../database/models/index.js";
import { ERROR_MESSAGES } from "../../constants/index.js";
import { NotFoundError } from "../../utils/index.js";

export const getAllUsers = async ({ page, limit }) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  return {
    users: users.map((u) => u.toObject()),
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      hasMore: page * limit < total,
    },
  };
};

export const getUserById = async (id) => {
  const user = await User.findOne({ _id: id });
  if (!user) throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
  return user.toObject();
};

export const updateUserRole = async ({ id, role }) => {
  const user = await User.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { role },
    { new: true },
  );
  if (!user) throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
  return user.toObject();
};

export const deleteUser = async (id) => {
  const user = await User.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
  );
  if (!user) throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
};
