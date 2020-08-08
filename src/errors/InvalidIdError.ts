import { HttpError } from "./HttpError";

export class  InvalidIdError extends HttpError{
    constructor (){
        super(400, 'Invalid ID')
    }
}