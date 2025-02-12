import { CookieOptions } from "express";

export const cookieOptions:CookieOptions = {
    httpOnly:true, maxAge:1000*60*60*24*3, secure:true, sameSite:"none"
};