import { HttpError } from "./HttpError";


export class UserMissingInputError extends HttpError {
    constructor(){//has no params
        super(400, 'Please fill out all necessary fields')
    }
}