import { Role } from "../models/Roles"

//updated for proj2
export class UsersDTO{
  user_id: number 
  username: string 
  password: string 
  first_name: string 
  last_name: string 
  birthday:Date
  phone_number: string
  email: string 
  role: Role
}
