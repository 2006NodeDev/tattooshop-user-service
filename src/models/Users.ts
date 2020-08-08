import { Role } from "./Roles"

//updated to reflect proj2
export class Users{
  	userId: number 
	username: string //not null unique
	password: string //not null
	firstName: string //not null
	lastName: string //not null
	birthday: Date //not null
	phoneNumber: string
	email: string //not null
	role: Role
}
