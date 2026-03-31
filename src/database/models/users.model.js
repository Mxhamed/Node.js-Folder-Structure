import mongoose from "mongoose";
import { GENDERS, USER_ROLES } from "../../constants/index.js";
import { decrypt, encrypt, maskPhone, getAge } from "../../utils/index.js";

const transformOptions = {
  getters: true,
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.firstName;
    delete ret.lastName;
    delete ret.phone;
    delete ret.dateOfBirth;
    return ret;
  },
};

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
      select: false,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      set: encrypt,
      get: decrypt,
    },

    gender: {
      type: String,
      required: true,
      enum: Object.values(GENDERS),
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    globalLogoutAt: {
      type: Date,
      select: false,
    },

    deletedAt: {
      type: Date,
      select: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: transformOptions,
    toObject: transformOptions,
    id: false,
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

userSchema.virtual("age").get(function () {
  return this.dateOfBirth ? getAge(this.dateOfBirth) : null;
});

export const User = mongoose.models?.User ?? mongoose.model("User", userSchema);
