import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import axiosInstance from '../axiosinterceptor';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

 
  const handleLogin = async () => {
    if (!form.username || !form.password) {
      setError('Please enter both username and password.')
      return
    }

    // Helper to try login for both roles
    const loginAttempt = async (url, role) => {
      try {
        const res = await axiosInstance.post(url, form);

        console.log(` ${role.toUpperCase()} Login Response:`, res.data)

        // Check for token type
        let jwtToken = null
        let storageKey = null

        if (role === 'admin' && res.data.token) {
          jwtToken = res.data.token
          storageKey = 'token'
        } else if (role === 'user' && res.data.usertoken) {
          jwtToken = res.data.usertoken
          storageKey = 'usertoken'
        }

        if (!jwtToken) throw new Error(`Token missing for ${role}`)

        // Save session info
        localStorage.setItem(storageKey, jwtToken)
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userRole', role)
        alert(`${role.toUpperCase()} logged in successfully.`)

        navigate(role === 'admin' ? '/admindashboard' : '/home')
        return true
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 404)) {
          return false
        }
        console.error(`${role} login error:`, err)
        throw err
      }
    }

    try {
      setError('')

      // Try admin login first
      const adminSuccess = await loginAttempt('/admin/login', 'admin')
      if (adminSuccess) return

      // Try user login if admin fails
      const userSuccess = await loginAttempt('/api/user/login', 'user')
      if (userSuccess) return

      setError('Invalid username or password.')
    } catch (err) {
      console.error('Login failed:', err)
      setError('An unexpected error occurred. Please try again later.')
    }
  }

  return (
  <div
    style={{
      textAlign: 'center',
      backgroundImage: "url('/images/bookbg3.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      overflow: 'hidden',
      width: '100vw',
      height: '100vh',
    }}
  >
    <div
      style={{
        backgroundColor: 'rgba(217, 236, 232, 0.5)',
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <h2
        style={{
          color: 'rgba(46, 104, 86, 0.8)',
          fontFamily: 'unset',
          paddingTop: '9%',
        }}
      >
        LOGIN
      </h2>

      <Box
        component="form"
        sx={{ '& > :not(style)': { m: 1, width: '35ch' } }}
        noValidate
        autoComplete="off"
        textAlign={'center'}
      >
        <TextField
          type="text"
          label="Username"
          variant="outlined"
          name="username"
          value={form.username}
          onChange={handleChange}
        />
        <br />
        <TextField
          type="password"
          label="Password"
          variant="outlined"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
      </Box>

      <br />

      <Button
        variant="contained"
        onClick={handleLogin}
        style={{
          width: '275px',
          height: '50px',
          backgroundColor: 'rgba(29, 138, 105, 0.8)',
          fontFamily: 'unset',
        }}
      >
        LOGIN
      </Button>

      <div style={{ marginTop: '15px' }}>
        <span style={{ color: '#2e6856', fontSize: '16px' }}>
          Don’t have an account?{' '}
        </span>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            navigate('/register')
          }}
          style={{
            color: 'rgba(29, 138, 105, 0.9)',
            fontWeight: 'bold',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => (e.target.style.textDecoration = 'underline')}
          onMouseOut={(e) => (e.target.style.textDecoration = 'none')}
        >
          Sign up
        </a>
      </div>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>
      )}
    </div>
  </div>
)
}


export default Login
