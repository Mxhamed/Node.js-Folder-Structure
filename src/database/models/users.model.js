import mongoose from "mongoose";
import { GENDERS, PATTERNS, USER_ROLES } from "../../constants/index.js";
import {
  hashPassword,
  decrypt,
  encrypt,
  maskPhone,
} from "../../utils/index.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 50,
    },

    lastName: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 50,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: {
        name: "idx_email_unique",
        unique: true,
      },
    },

    password: {
      type: String,
      required: true,
      set: hashPassword,
    },

    phone: {
      type: String,
      required: true,
      pattern: PATTERNS.PHONE,
      set: encrypt,
      get: decrypt,
    },

    gender: {
      type: String,
      required: true,
      enum: Object.values(GENDERS),
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },

    emailVerifiedAt: {
      type: Date,
    },

    globalLogoutAt: {
      type: Date,
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    versionKey: false, // Removes the `__v` Field
    timestamps: true, // Adds `createdAt` & `updatedAt` Fields
    toJSON: { getters: true, virtuals: true }, // Include Getters & Virtuals When Converting to JSON
    toObject: { getters: true, virtuals: true }, // Include Getters & Virtuals When Converting to Plain Object
    id: false, // Disables the Automatic `id` Virtual Getter
  },
);

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual("fullName").set(function (name) {
  const [first, last] = name.split(" ");
  this.firstName = first;
  this.lastName = last;
});

userSchema.virtual("maskedPhone").get(function () {
  return maskPhone(this.phone);
});

export const User = mongoose.models?.User ?? mongoose.model("User", userSchema);
