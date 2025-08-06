import {NextFunction, Request, Response} from "express";
import {getUserData, IUserToken} from "../utils/jwt";
import {sendResponse} from "../utils/sendResponse";

export interface IReqUser extends Request {
    user?: IUserToken;
}

export default (req: IReqUser, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    const unauthorized = () => sendResponse(res, 403, "Unauthorized");
    if (!authorization) return unauthorized();

    const [prefix, token] = (authorization || "").split(" ");
    if (!(prefix === "Bearer" && token)) return unauthorized();

    const user = getUserData(token);
    if (!user) return unauthorized();

    req.user = user;
    next();
};
