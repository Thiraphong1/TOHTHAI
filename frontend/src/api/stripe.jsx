import axios from "axios"

export const payment =async(token)=> 
    await axios.post('https://tohthaiback.vercel.app/api/user/create-checkout-session',
    {},{
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
)