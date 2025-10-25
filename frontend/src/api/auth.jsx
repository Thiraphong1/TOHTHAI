import axios from "axios"

const currentUser =async(token)=> await axios.post('http://localhost:3000/api/current-user',
    {},{
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
)
const currentAdmin =async (token)=> {
    return await axios.post('http://localhost:3000/api/current-admin',
    {},{
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
)
}
const currentEmployee =async (token)=> {
    return await axios.post('http://localhost:3000/api/current-employee',
    {},{
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
)
}
const currentCook =async (token)=> {
    return await axios.post('http://localhost:3000/api/current-cook',
    {},{
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
)
}
export const resetPassword = ({ token, newPassword }) => {
    return axios.post('http://localhost:3000/api/reset-password', {
        token: token,
        newPassword: newPassword,
    });
};
export {currentUser, currentAdmin, currentEmployee,currentCook}