import {HttpError} from './HttpError'

export class UserNotFound extends HttpError{
    constructor(){
        super(404, 'User Not Found')
    }
}