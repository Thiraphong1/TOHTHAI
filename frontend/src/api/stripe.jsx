import axios from "axios"

export const payment =async(token)=> 
    await axios.post('https://tohthaibackend.vercel.app/api/user/create-checkout-session',
    {},{
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
)