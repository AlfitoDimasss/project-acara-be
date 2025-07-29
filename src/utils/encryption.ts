import crypto from "crypto";
import {SECRET} from "./env";

export const encrypt = (password: string): string => {
    return crypto
        .pbkdf2Sync(password, SECRET, 1000, 64, "sha512")
        .toString("hex");
};
