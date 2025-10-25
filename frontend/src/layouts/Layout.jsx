import React from 'react'
import { Outlet } from 'react-router-dom'
import NavMain from '../components/NavMain'
import { ToastContainer } from 'react-toastify';

const Layout = () => {
  return (
    <div>
      <NavMain />
      <ToastContainer />
      
      <main className='h-full px-4'>
        <Outlet />
      </main>

    </div>
  )
}

export default Layout
