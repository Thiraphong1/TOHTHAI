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
export {currentUser, currentAdmin}