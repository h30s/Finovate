import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  financialProfile: {
    literacyScore: number;
    investmentExperience: 'beginner' | 'intermediate' | 'advanced';
    completedModules: string[];
    achievements: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    financialProfile: {
      literacyScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 1000,
      },
      investmentExperience: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
      },
      completedModules: [{
        type: String,
      }],
      achievements: [{
        type: String,
      }],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
