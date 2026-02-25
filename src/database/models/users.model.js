import mongoose from "mongoose";
import { USER_ROLES } from "../../constants/index.js";

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^\S+@\S+\.\S+$/,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: mongoose.Schema.Types.Int32,
      min: 16,
      max: 120,
    },
    role: {
      type: String, enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    lastLogin: {
      type: date,
      default: Date.now, // Pass the Function Reference
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile"
    },
  }, {
    versionKey: false, // Removes the `__v` Field
    timestamps: true, // Adds `createdAt` & `updatedAt` Fields
    toJSON: { virtuals: true }, // Include Virtuals When Converting to JSON
    toObject: { virtuals: true }, // Include Virtuals When Converting to Plain Object
    id: false // Disables Automatic `id` Getter
  },
);

// Getter → Combines Fields
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Setter → Splits Value into Fields
userSchema.virtual("fullName").set(function (name) {
  const [first, last] = name.split(" ");
  this.firstName = first;
  this.lastName = last;
});

export const User = mongoose.models?.User ?? mongoose.model("User", userSchema);