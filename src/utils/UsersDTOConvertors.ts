
import { UsersDTO } from "../dtos/user-dto";
import { Users } from "../models/Users";

//updated for proj2
export function UsersDTOtoUsersConvertor(udto:UsersDTO) : Users{
    return{
        userId: udto.user_id,
        username: udto.username,
        password: udto.password,
        firstName: udto.first_name,
        lastName: udto.last_name,
        birthday: udto.birthday,
        phoneNumber: udto.phone_number,
        email: udto.email,
        role: udto.role,

    }
}

