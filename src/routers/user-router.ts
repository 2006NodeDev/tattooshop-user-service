import express, { Request, Response, NextFunction } from 'express'
import { authorizationMiddleWare } from '../middlewares/authorizationMiddleware';
import { Users } from '../models/Users';
import { InvalidIdError } from '../errors/InvalidIdError';
import { AuthenticationFailure } from '../errors/AuthenticationFailure';
import { authenticationMiddleware } from '../middlewares/authentication-middleware';
import { getAllUsersService, findUserByIdService, UpdateExistingUserService, SubmitNewUserService, getAllArtistsService, } from '../services/user-service';
import { UserMissingInputError } from '../errors/UserMissingInputError';
import { JWTVerifyMiddleware } from '../middlewares/jwt-verify-middleware';

export let userRouter = express.Router();

//new user
userRouter.post('/',  async (req: Request, res: Response, next: NextFunction) => {
    // get input from the user
    let { firstName, lastName, username, password, birthday, phoneNumber, email, role} = req.body//a little old fashioned destructuring
    //verify that input
    if (!firstName || !lastName || !username || !password || !role) {
        next(new UserMissingInputError)
    } else {
        //try  with a function call to the dao layer to try and save the user
        let newUser: Users = {
            firstName,
            lastName,
            username,
            password,
            birthday,
            phoneNumber,
            role,
            userId:0,
            email
        }
        newUser.email = email || null
        newUser.birthday = birthday || null
        newUser.phoneNumber = phoneNumber || null
       
        try {
            let savedUser = await SubmitNewUserService(newUser)
            res.json(savedUser)// needs to have the updated userId
        } catch (e) {
            next(e)
        }
    }
})


userRouter.use(authenticationMiddleware)
userRouter.use(JWTVerifyMiddleware)

//get all
userRouter.get('/', authorizationMiddleWare(['admin']), async (req:any, res:Response, next:NextFunction)=>{
    try {
        let getAllusers = await getAllUsersService()
        res.json(getAllusers)
    } catch (error) {
        next(error)
    }
})

//find by id
userRouter.get('/userid/:id', authorizationMiddleWare(['admin' ,'customer', 'artist']), async (req:any, res:Response, next:NextFunction) =>{
    let {id} = req.params
    if(isNaN(+id)){
        res.status(400).send('Id must be a number')
    }else if(req.user.userId !== +id && req.user.role === "customer" && req.user.role === "artist"){
        next(new AuthenticationFailure())
    }
    else {
        try {
            let userById = await findUserByIdService(+id)
            res.json(userById)
        } catch (error) {
            next(error)
        }
    }
})

// Update User / Allowed Admin // For Project 1 user can also update his/her own info

userRouter.patch('/', authorizationMiddleWare(['admin', 'customer', 'artist']), async (req:any, res:Response, next:NextFunction)=>{
    
        let{
        userId,
        username,
        password,
        firstName,
        lastName,
        birthday,
        phoneNumber,
        email,
        role,
        } = req.body

        if(!userId || isNaN(req.body.userId)){
            next(new InvalidIdError())
            
        }else if(req.user.userId !== +userId  && req.user.role === "customer" || req.user.role === "artist"){
            next(new AuthenticationFailure())
        }else { 
        let updatedUser: Users = {
            userId,
            username, 
            password, 
            firstName,
            lastName,
            birthday,
            phoneNumber,
            email,
            role
        }
        updatedUser.username= username ||undefined
        updatedUser.password = password || undefined
        updatedUser.firstName = firstName || undefined
        updatedUser.lastName = lastName || undefined
        updatedUser.birthday = birthday || undefined
        updatedUser.phoneNumber = phoneNumber || undefined
        updatedUser.email = email || undefined
        updatedUser.role = role || undefined
        
        console.log(updatedUser)
        try {
            let updateResults = await UpdateExistingUserService(updatedUser)
            res.json(updateResults)
        } catch (error) {
            next(error)
        }
    }
})

//get all artists
userRouter.get('/artists', async (req:Request, res:Response, next:NextFunction)=>{
    try {
        let getAllArtists = await getAllArtistsService()
        res.json(getAllArtists)
    } catch (error) {
        next(error)
    }
})

//get Artist by Style
userRouter.get('/artist/:id', async (req:Request, res:Response, next:NextFunction) =>{
    let {id} = req.params
    if(isNaN(+id)){
        res.status(400).send('Id must be a number')
    }
    else {
        try {
            let artistByStyle = await findUserByIdService(+id)
            res.json(artistByStyle)
        } catch (error) {
            next(error)
        }
    }
})

