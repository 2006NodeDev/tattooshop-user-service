import {HttpError} from './HttpError'

export class ArtistNotFound extends HttpError{
    constructor(){
        super(404, 'Artist Not Found')
    }
}