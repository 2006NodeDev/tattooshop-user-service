  
import { Response, NextFunction} from "express";
import jwt from 'jsonwebtoken'
import { logger, errorLogger } from "../utils/logger";


export const JWTVerifyMiddleware = (req: any, res: Response, Next: NextFunction) => {
    try {
        
        // ?. operator is really just short hand for the guard operator
        // req.headers.authorization && req.headers.authorization.split(' ').pop()
       // if there isn't any token
     let token = req.headers.authorization && req.headers.authorization.split(' ').pop() //turn the string Bearer token -> token
       if(token){
            req.user =  jwt.verify(token, 'thisIsASecret')
           // req.user = jwt.verify(token, process.env['LB_SCHEMA'])
        }
        Next()
    } catch (e) {
        logger.error(e)
        errorLogger.error(e)
        Next(e)
    }
}


