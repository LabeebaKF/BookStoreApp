import { Box, Button, TextField, useMediaQuery } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosinterceptor';

const Register = () => {
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    phoneno: '',
    address: '',
    password: '',
    confirmPassword: '',
    captcha: '',
  });

  const [captchaSvg, setCaptchaSvg] = useState(''); 
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phoneno) => /^\d{10}$/.test(phoneno);

  const fetchCaptcha = async () => {
    try {
      const response = await axiosInstance.get('/api/user/captcha');
      const svgText = response.data;
      setCaptchaSvg(svgText);
    } catch (err) {
      console.error('Captcha fetch failed:', err);
    }
  };

  useEffect(() => {
    fetchCaptcha(); 
  }, []);

  const handleRegister = async () => {
    if (!form.username || !form.phoneno || !form.password || !form.confirmPassword || !form.captcha) {
      setError('All fields including captcha are required.');
      return;
    }

    if (!validateEmail(form.username)) {
      setError('Username must be a valid email address.');
      return;
    }

    if (!validatePhone(form.phoneno)) {
      setError('Phone number must be a 10 digit number.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await axiosInstance.post('/api/user/register', {
        username: form.username,
        phoneno: form.phoneno,
        address: form.address,
        password: form.password,
        confirmpassword: form.confirmPassword,
        captcha: form.captcha,
      });

      const data = response.data;

      if (response.status === 200) {
        setSuccess('Registration successful!');
        setError('');
        setForm({
          username: '',
          phoneno: '',
          address: '',
          password: '',
          confirmPassword: '',
          captcha: '',
        });
        fetchCaptcha(); // refresh captcha
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed.');
        fetchCaptcha(); // refresh captcha on failure
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Server error during registration.');
      fetchCaptcha();
    }
  };

  return (
    <div
      style={{
        textAlign: 'center',
        background: 'linear-gradient(180deg, white 0%, rgba(206, 218, 215, 1) 100%)',
        minHeight: '100vh',
        minWidth: '100vw',
        padding: isSmallScreen ? '20px' : '40px 0',
        overflowY: 'auto',
      }}
    >
      <div style={{width:"700px",height:"auto",textAlign:"center",margin:"auto",paddingTop:"15px", backgroundColor:"rgba(214, 221, 219, 1)",borderRadius:"8px",boxShadow:"inherit"}}>
      <h2
        style={{
          color: 'rgba(46, 104, 86, 0.8)',
          fontFamily: 'inherit',
          marginBottom: '30px',
          fontSize: isSmallScreen ? '1.6rem' : '2rem',
        }}
      >
        REGISTER
      </h2>

      <Box
        component="form"
        sx={{
          '& > :not(style)': {
            m: 1,
            width: isSmallScreen ? '90%' : '35ch',
          },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        noValidate
        autoComplete="off"
      >
        <TextField label="Username(Email)" name="username" value={form.username} onChange={handleChange} style={{ width: '400px' }} />
        <TextField label="Phone Number" name="phoneno" value={form.phoneno} onChange={handleChange} style={{ width: '400px' }} />
        <TextField label="Address" name="address" value={form.address} onChange={handleChange} style={{ width: '400px' }} />
        <TextField type="password" label="Password" name="password" value={form.password} onChange={handleChange} style={{ width: '400px' }} />
        <TextField
          type="password"
          label="Confirm Password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          style={{ width: '400px' }}
        />
        <TextField label="Enter Captcha" name="captcha" value={form.captcha} onChange={handleChange} style={{ width: '400px' }} />

      
        <div
          dangerouslySetInnerHTML={{ __html: captchaSvg }}
          style={{
            display: 'block',
            margin: '15px auto 20px auto',
            width: isSmallScreen ? '160px' : '180px',
            height: '60px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            backgroundColor: '#fff',
          }}
        />

        <Button
          variant="text"
          onClick={fetchCaptcha}
          sx={{ color: 'rgba(29, 138, 105, 0.9)', fontWeight: 'bold', mb: 1 }}
        >
          ↻ Refresh Captcha
        </Button>

        <Button
          variant="contained"
          onClick={handleRegister}
          sx={{
            width: isSmallScreen ? '80%' : '275px',
            height: '50px',
            backgroundColor: 'rgba(29, 138, 105, 0.8)',
            fontFamily: 'inherit',
            mt: 2,
            '&:hover': { backgroundColor: 'rgba(29, 138, 105, 1)' },
          }}
        >
          REGISTER
        </Button>

       
        <p style={{ marginTop: '15px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'rgba(29, 138, 105, 0.9)', fontWeight: 'bold', textDecoration: 'none' }}>
            Login
          </Link>
        </p>
      </Box>

      {error && <div style={{ color: 'red', marginTop: '15px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: '15px' }}>{success}</div>}
    </div>
    </div>
  );
};

export default Register;
