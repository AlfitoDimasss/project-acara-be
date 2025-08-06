import {Request, Response} from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import {encrypt} from "../utils/encryption";
import {generateToken} from "../utils/jwt";
import {IReqUser} from "../middlewares/auth.middleware";
import {sendResponse} from "../utils/sendResponse";

type TRegister = {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string
};

type TLogin = {
    identifier: string;
    password: string;
};

const hasUppercase = /[A-Z]/;
const hasNumber = /\d/;

const registerValidateSchema = Yup.object({
    fullName: Yup.string().required("Full name is required"),
    username: Yup.string().required("Username is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required").min(6, "Password must be at least 6 character")
        .test("uppercase", "Password must contain at least one uppercase letter", (value) => {
            return hasUppercase.test(value || "");
        })
        .test("at-leat-one-number", "Password must contain one number", (value) => {
            return hasNumber.test(value || "");
        }),
    confirmPassword: Yup.string().required("Confirm password is required")
        .oneOf([Yup.ref("password"), ""], "Password is not match"),
});

const loginValidateSchema = Yup.object({
    identifier: Yup.string().required("Identifier is required"),
    password: Yup.string().required("Password is required")
});

export default {
    async register(req: Request, res: Response) {
        /**
         #swagger.tags = ['Auth']
         */
        const {fullName, username, email, password, confirmPassword} =
            req.body as unknown as TRegister;
        try {
            await registerValidateSchema.validate({
                fullName,
                username,
                email,
                password,
                confirmPassword,
            });

            const result = await UserModel.create({
                fullName,
                username,
                email,
                password,
            });

            sendResponse(res, 200, "Success", result);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            sendResponse(res, 400, message);
        }
    },
    async login(req: Request, res: Response) {
        /**
         #swagger.tags = ['Auth']
         #swagger.requestBody = {
         required: true,
         schema: {$ref: "#/components/schemas/LoginRequest"}
         }
         */
        const {identifier, password} = req.body as unknown as TLogin;

        try {
            await loginValidateSchema.validate({
                identifier, password
            });

            const userByIdentifier = await UserModel.findOne({
                $or: [
                    {
                        email: identifier,
                    },
                    {
                        username: identifier,
                    },
                ],
                isActive: true
            });

            if (!userByIdentifier) {
                return sendResponse(res, 403, "Invalid credential");
            }

            const validatePassword: boolean =
                encrypt(password) === userByIdentifier.password;

            if (!validatePassword) {
                return sendResponse(res, 403, "Invalid credential");
            }

            const token = generateToken({
                id: userByIdentifier._id,
                role: userByIdentifier.role,
            });

            sendResponse(res, 200, "Login success", token);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            sendResponse(res, 400, message);
        }
    },
    async me(req: IReqUser, res: Response) {
        /**
         #swagger.tags = ['Auth']
         #swagger.security = [{
         "bearerAuth": []
         }]
         */
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id);
            sendResponse(res, 200, "Login success", result);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            sendResponse(res, 400, message);
        }
    },
    async activation(req: Request, res: Response) {
        /**
         #swagger.tags = ['Auth']
         #swagger.requestBody = {
         required: true,
         schema:{$ref: '#/components/schemas/ActivationRequest'}
         }
         */
        try {
            const {code} = req.body as { code: string };
            const user = await UserModel.findOneAndUpdate(
                {
                    activationCode: code
                },
                {
                    isActive: true
                },
                {
                    new: true
                }
            );

            sendResponse(res, 200, "User successfully activated", user);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            sendResponse(res, 400, message);
        }
    }
};
