import React, {useState,useEffect, use} from 'react'
import useEcomStore from '../store/EcomStore'
import { currentAdmin } from '../api/auth'
import LoadingToRedirect from './LoadingToRedirect'


const ProtectRouteAdmin = ({element}) => {
    const [ok,setOk] = useState(false)
    const user = useEcomStore((state)=> state.user)
    const token = useEcomStore((state)=> state.token)
    
    useEffect(()=>{
        if(user && token){
            // set to backend for verify
            currentAdmin(token)
            .then((res)=>setOk(true))
            .catch((err)=>setOk(false))
        }
    },[])

  return ok ? element : <LoadingToRedirect />
}

export default ProtectRouteAdmin
