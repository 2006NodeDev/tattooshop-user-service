import { PoolClient, QueryResult } from "pg";
import { connectionPool } from ".";
import { Users } from "../../models/Users";
import { UsersDTOtoUsersConvertor } from "../../utils/UsersDTOConvertors";
import { AuthFailureError } from "../../errors/AuthFailureError";
import { UserNotFound } from "../../errors/UserNotFoundError";
import {ArtistNotFound } from '../../errors/ArtistNotFound'
import { logger, errorLogger } from "../../utils/logger";

const schema = process.env['LB_SCHEMA'] || 'tattoobooking_user_service'


//Promise is representation of a future value of an error
export async function getAllUsers():Promise<Users[]>{
    let client: PoolClient;
    try {
        client = await connectionPool.connect()
        let getAllUsers:QueryResult = await client.query(`select u.user_id, 
        u.username,  
        u."password", u.first_name,
        u.last_name, u.birthday, u.phone_number, u.email,
        r."role" , r.role_id
        from ${schema}.users u  left join ${schema}.roles r on u."role" = r.role_id;`)
        return getAllUsers.rows.map(UsersDTOtoUsersConvertor)
    } catch (e) {
        logger.error(e);
        errorLogger.error(e)
        throw new Error ('Unhandled Error')
    }finally{
        //  && guard operator we are making sure that client is exist then we release
        client && client.release()
    }
}



export async function findUserById(id:number):Promise<Users>{
    let client: PoolClient;
    try {
        client = await connectionPool.connect()
        let getUserById:QueryResult = await client.query(`select u.username,  
        u."password", u.first_name, 
        u.last_name, u.email, u.birthday, u.phone_number,
        r."role" , r.role_id
        from ${schema}.users u  left join ${schema}.roles r on u."role" = r.role_id 
        where u.user_id = $1;`, [id])
        if(getUserById.rowCount === 0){
            throw new Error('User not found')
        }else{
            // because there will be one object
            return UsersDTOtoUsersConvertor(getUserById.rows[0])
        }
    } catch (error) {
        if(error.message === 'User not found'){
            throw new UserNotFound();
        }
        logger.error(error);
        errorLogger.error(error)
        throw new Error('Unimplemented error')
    }finally{
        //  && guard operator we are making sure that client is exist then we release
        client && client.release()
    }
}

export async function getUserByusernameAndPassword(username, password):Promise<Users>{
    let client:PoolClient;
    try {
        client = await connectionPool.connect()
        let results:QueryResult = await client.query(`select u.user_id, u.username,  
        u."password", u.first_name, 
        u.last_name, u.email, u.birthday, u.phone_number,
        r."role" , r.role_id
        from ${schema}.users u  left join ${schema}.roles r on u."role" = r.role_id 
        where u.username = $1 and u.password = $2;`, [username, password])
        if(results.rowCount === 0){
            throw new Error('User not found')
        }else{
            // because there will be one object
            return UsersDTOtoUsersConvertor(results.rows[0])
        }
    } catch (error) {
        if(error.message === 'User not found'){
            throw new AuthFailureError()
        }
        logger.error(error);
        errorLogger.error(error)
        throw new Error('Unimplemented Error')
    }finally{
        //  && guard operator we are making sure that client is exist then we release
        client && client.release()
    }
}

//updated for project 2
export async function UpdateExistingUser(updatedUser:Users):Promise<Users>{
    let client : PoolClient
    try {
        client = await connectionPool.connect()
        await client.query('BEGIN;')
        if(updatedUser.username){
            await client.query('update ${schema}.users set username = $1 where user_id = $2;', [updatedUser.username, updatedUser.userId])
        }
        if(updatedUser.password){
            await client.query('update ${schema}.users set password = $1 where user_id = $2;', [updatedUser.password, updatedUser.userId])
        }
        if(updatedUser.firstName){
            await client.query('update ${schema}.users set first_name = $1 where user_id = $2;', [updatedUser.firstName, updatedUser.userId])
        }
        if(updatedUser.lastName){
            await client.query('update ${schema}.users set last_name= $1 where user_id = $2;', [updatedUser.lastName, updatedUser.userId])
        }
        if(updatedUser.email){
            await client.query('update ${schema}.users set email = $1 where user_id = $2;', [updatedUser.email , updatedUser.userId])
        }
        if(updatedUser.birthday){
            await client.query('update ${schema}.users set birthday = $1 where user_id = $2;', [updatedUser.birthday , updatedUser.userId])
        }
        if(updatedUser.phoneNumber){
            await client.query('update ${schema}.users set phone_number = $1 where user_id = $2;', [updatedUser.phoneNumber , updatedUser.userId])
        }
        
        if(updatedUser.role ){
          let roleId =   await client.query(`select r.role_id from ${schema}.roles r  where r.role = $1;`, [updatedUser.role])
          if(roleId.rowCount === 0){
              throw new Error ('Role not found')
          }
          roleId = roleId.rows[0].roleId
          await client.query('update ${schema}.users set "role"= $1 where user_id = $2;', [roleId, updatedUser.userId])
        }
        await client.query('COMMIT;') 
        return findUserById(updatedUser.userId)

    } catch (error) {
        client && client.query('ROLLBACK;')
        if(error.message === 'Role not found'){
            throw new Error('Role not found')
        }
        logger.error(error);
        errorLogger.error(error)
        throw new Error ('Unhandled Error')
    }finally{
        client && client.release();
    }
}

export async function submitNewUser(newUser: Users):Promise<Users>{
    let client: PoolClient 
    try {
        client = await connectionPool.connect()
        await client.query('BEGIN;')

        let newuserinfo = await client.query(`insert into ${schema}.users("username", 
            "password",
            "first_name",
            "last_name",
            "email", "birthday", "phone_number", "role") values ($1, $2, $3, $4, $5, $6, $7, $8) returning "user_id" `, 
            [newUser.username, newUser.password, newUser.firstName, newUser.lastName, newUser.email, newUser.birthday, newUser.phoneNumber, newUser.role])
            newUser.userId = (await newuserinfo).rows[0].userId
            await client.query('COMMIT;')
            return newUser

    } catch (error) {
        client && client.query('ROLLBACK;')
        if(error.message === 'Role not found') {
            throw new Error('something went wrong')
        }
        logger.error(error);
        errorLogger.error(error)
        throw new Error('un implemented error handling')
    }finally {
        client && client.release();
    }
}

//get all artists- was originally going to be in booking, but all the info comes from user db and none from booking db

export async function getAllArtists():Promise<Users[]>{
    let client: PoolClient;
    try {
        client = await connectionPool.connect()
        let getAllUsers:QueryResult = await client.query(`select u.user_id, 
        u.username,  
        u."password", u.first_name,
        u.last_name, u.birthday, u.phone_number, u.email,
        r."role" , r.role_id
        from ${schema}.users u  left join ${schema}.roles r on u."role" = r.role_id
        where r.role_id = 3;`)
        return getAllUsers.rows.map(UsersDTOtoUsersConvertor)
    } catch (error) {
        logger.error(error);
        errorLogger.error(error)
        throw new Error('Unimplemented Error')
    }finally{
        client && client.release()
    }
}

//hasn't been tested in Postman but the SQL has been tested in DBeaver
//the sql statement is not the prettiest, but we can limit what gets seen with the ui
export async function getArtistByStyle(id:number) {
    let client: PoolClient;
    try{
        client = await connectionPool.connect()
        let results: QueryResult = await client.query(`select u.user_id, u.username, u.first_name, u.last_name, 
        u.phone_number, u.email, u."role", 
        as1."style", s.style_name 
        from ${schema}.users u 
        left join tattoobooking_booking_service.artist_styles as1 on u.user_id = as1.artist
        left join tattoobooking_booking_service.styles s on as1."style" = s.style_id 
        where as1."style" = ${id} ;`)
        if(results.rowCount === 0){
            throw new Error('NotFound')
        }else{
            return UsersDTOtoUsersConvertor(results.rows[0])
        }
    }catch(e){
        if(e.message === 'NotFound'){
            throw new ArtistNotFound()
        }
        logger.error(e);
        errorLogger.error(e)
        throw new Error('Unimplemented error handling')
    }finally{
        client && client.release()
    }
}

            
