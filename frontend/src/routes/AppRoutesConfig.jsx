//rafce
import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from '../pages/Home'
import Layout from '../layouts/Layout'
import Register from '../pages/auth/Register'
import Login from '../pages/auth/Login'
import Checkout from '../pages/Checkout'
import Dashboard from '../pages/admin/Dashboard'
import LayoutAdmin from '../layouts/LayoutAdmin'
import LayoutUser from '../layouts/LayoutUser'
import Homeuser from '../pages/user/Homeuser'
import Table from '../pages/Table'
import Category from '../pages/admin/Category'
import Product from '../pages/admin/Product'
import Manage from '../pages/admin/Manage'
import History from '../pages/user/History'
import Menu from '../pages/Menu'
import Cart from '../pages/Cart'
import ProtectRouteUser from './ProtectRouteUser'
import ProtectRouteAdmin from './ProtectRouteAdmin'
import Personal from '../pages/admin/Personal'
import Storage from '../pages/admin/Storage'
import EditProduct from '../pages/admin/EditProduct'
import StripePayment from '../pages/user/StripePayment'
import CheckoutSuccess from '../components/CheckoutSuccess'
import MOrder from '../pages/admin/MOrder'


const router = createBrowserRouter([
    { 
        path: "/", 
        element:<Layout /> , 
        children: [

            { index: true, element: <Home /> },
            { path: "table", element:<Table /> },
            { path: "history", element:<History /> },
            { path: "register", element:<Register /> },
            { path: "login", element:<Login /> },
            { path: "checkout", element:<Checkout /> },
            { path: "menu", element:<Menu /> },
            { path: "cart", element:<Cart /> },

    ],
},
    { 
        path: "/admin", 
        element:<ProtectRouteAdmin element={<LayoutAdmin />} /> , 
        children: [

            { index: true, element:<Dashboard /> },
            { path: 'category', element:<Category /> },
            { path: 'product', element:<Product /> },
            { path: 'product/:id', element:<EditProduct /> },
            { path: 'manage', element:<Manage /> },
            { path: 'personal', element:<Personal /> },
            { path: 'storage', element:<Storage /> },
            { path: 'orders', element:<MOrder /> },

            

    ],
},
    { 
        path: "/user", 
        //element:<LayoutUser /> , 
        element:<ProtectRouteUser element={<LayoutUser />} /> , 
        children: [

            { index: true, element:<Homeuser /> },
            { path: 'payment', element:<StripePayment /> },
            {path: 'history', element:<History /> },
            {path: 'checkout-success', element:<CheckoutSuccess /> }

    ],
},

     
])


const AppRoutesConfig = () => {
  return (
    <>
        <RouterProvider router={router} />
    </>
  )
}

export default AppRoutesConfig
