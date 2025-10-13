import React from 'react'
import { Outlet } from 'react-router-dom'
import NavMain from '../components/NavMain'

const Layout = () => {
  return (
    <div>
      <NavMain />
      
      <main className='h-full px-4'>
        <Outlet />
      </main>

    </div>
  )
}

export default Layout
