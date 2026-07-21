import { Payload } from "../../typings/payload.typings.js";
import jwt from "jsonwebtoken";
import { Apperror } from "./error.js";

export function signAccessToken(payload: Payload) {
  const secret = process.env.ACCESSTOKEN;

  if (!secret) {
    throw new Apperror("Access token secret missing", 400);
  }

  return jwt.sign(payload, secret, {
    expiresIn: "15m",
  });
}

export function signRefreshToken(payload: Payload) {
  const secret = process.env.REFRESHTOKEN;

  if (!secret) {
    throw new Apperror("Refresh token secret missing", 400);
  }

  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token: string) {
  const secret = process.env.ACCESSTOKEN;

  if (!secret) {
    throw new Apperror("Access token secret missing", 400);
  }

  return jwt.verify(token, secret) as Payload;
}

export function verifyRefreshToken(token: string) {
  const secret = process.env.REFRESHTOKEN;

  if (!secret) {
    throw new Apperror("Refresh token secret missing", 400);
  }

  return jwt.verify(token, secret) as Payload;
}
