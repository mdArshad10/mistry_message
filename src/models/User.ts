import mongoose,{Schema, Document} from 'mongoose';

export interface Message extends Document{
    content: string;
    createdAt: Date;
}

const MessageSchema:Schema<Message> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})


export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry:Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  message:Message[]
}

const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    match: [/\b[w.-]+@[w.-]+.w{2,4}\b/gi, "plz use a valid email address"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  verifyCode: {
    type: String,
    required: [true, 'verifyCode is required'],
  },
  verifyCodeExpiry: {
    type: Date,
    default: Date.now,
  },
  isVerified:{
    type: Boolean,
    default: false,
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true,
  },
  message: {
    type: [MessageSchema],
  },
});

const UserModel = (mongoose.models.User as mongoose.Model<User>) || (mongoose.model<User>('User', UserSchema))

export {UserModel}