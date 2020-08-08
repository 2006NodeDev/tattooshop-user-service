import { HttpError } from "./HttpError";

export class AuthenticationFailure extends HttpError{
    constructor(){
        super(401, "You are not authrozied to perform this action")
    }
}
