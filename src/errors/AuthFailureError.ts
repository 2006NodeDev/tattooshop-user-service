import { HttpError } from "./HttpError";

export class AuthFailureError extends HttpError{
    constructor(){
        super(401, "Invalid Username or Password")
    }
}
