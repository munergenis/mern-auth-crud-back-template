import mongoose from 'mongoose';
import { hashValue, compareValue } from '../../../lib/utils/bcrypt';

export interface UserDocument extends mongoose.Document {
  comparePassword(val: string): Promise<boolean>;
  createdAt: Date;
  email: string;
  omitPassword(): Omit<UserDocument, 'password'>;
  password: string;
  updatedAt: Date;
  verified: boolean;
}

export type UserId = mongoose.Types.ObjectId;

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { required: true, type: String, unique: true },
    password: { required: true, type: String },
    verified: { default: false, required: true, type: Boolean },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  this.password = await hashValue(this.password);
  next();
});

userSchema.methods.comparePassword = async function (val: string) {
  return compareValue(val, this.password);
};
userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<UserDocument>('User', userSchema);
export default UserModel;
