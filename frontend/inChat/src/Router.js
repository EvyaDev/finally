import React, { useContext } from 'react'
import { Route, Routes } from 'react-router'
import Login from './Login'
import Main from './Main'
import Register from './Register'
import { GeneralContext } from './App'

export default function Router() {
    const { isLogged } = useContext(GeneralContext)
    return (
        <Routes>
            <Route path='/' element={isLogged ? <Main /> : <Login />} />
            <Route path='/login' element={<Login />} />
            <Route path='/Register' element={<Register />} />
        </Routes>
    )
}
