import {Types} from "mongoose";
import {User} from "../models/user.model";
import jwt from "jsonwebtoken";
import {SECRET} from "./env";

export interface IUserToken
    extends Omit<
        User,
        | "password"
        | "activationCode"
        | "isActive"
        | "email"
        | "fullName"
        | "profilePicture"
        | "username"
    > {
    id?: Types.ObjectId;
}

export const generateToken = (user: IUserToken): string => {
    return jwt.sign(user, SECRET, {
        expiresIn: "1h",
    });
};

export const getUserData = (token: string) => {
    return jwt.verify(token, SECRET) as IUserToken;
};
