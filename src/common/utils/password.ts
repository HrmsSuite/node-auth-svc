import bcrypt from "bcrypt";
export function Hashpassword(password: string) {
  return bcrypt.hash(password, 10);
}
export function ReHashPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
