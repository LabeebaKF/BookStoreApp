import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PRIMARY_COLOR = 'rgba(27, 136, 100, 1)';

const AuthorSubmission = () => {
  const [form, setForm] = useState({
    title: '',
    synopsis: '',
    genre: '',
    authorName: '',
    coverImage: null,
    manuscript: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) setForm(prev => ({ ...prev, authorName: username }));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('usertoken');
    if (!token) {
      setError('You must be logged in to submit a book.');
      return;
    }

    if (!form.title || !form.synopsis || !form.authorName) {
      setError('Title, Synopsis, and Author Name are required.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('synopsis', form.synopsis);
      data.append('genre', form.genre);
      data.append('authorName', form.authorName);
      if (form.coverImage) data.append('coverImage', form.coverImage);
      if (form.manuscript) data.append('manuscript', form.manuscript);

      const res = await fetch('http://localhost:3000/api/submission', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      const resData = await res.json();

      if (!res.ok) {
        setError(resData.message || 'Failed to submit the book.');
      } else {
        setSuccess('Book submitted successfully!');
        setForm({
          title: '',
          synopsis: '',
          genre: '',
          authorName: localStorage.getItem('username') || '',
          coverImage: null,
          manuscript: null
        });
      }
    } catch (err) {
      console.error('Submission Error:', err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      paddingTop: "80px",
      minHeight: "calc(100vh - 160px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundImage: "url('/images/bookbg3.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>
      <Box sx={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        p: 4,
        borderRadius: 3,
        width: { xs: '90%', sm: '500px' },
        boxShadow: 3
      }}>
        <Typography variant="h4" sx={{ color: PRIMARY_COLOR, mb: 3, textAlign: 'center' }}>
          Publish Your Book
        </Typography>

        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} noValidate>
          <TextField
            label="Author Name"
            name="authorName"
            value={form.authorName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Book Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Synopsis"
            name="synopsis"
            value={form.synopsis}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
          />
          <TextField
            label="Genre"
            name="genre"
            value={form.genre}
            onChange={handleChange}
            fullWidth
          />

          <Button variant="outlined" component="label">
            Upload Cover Image
            <input type="file" name="coverImage" hidden onChange={handleChange} accept="image/*"/>
          </Button>
          {form.coverImage && <Typography variant="body2">{form.coverImage.name}</Typography>}

          <Button variant="outlined" component="label">
            Upload Manuscript
            <input type="file" name="manuscript" hidden onChange={handleChange} accept=".pdf,.doc,.docx"/>
          </Button>
          {form.manuscript && <Typography variant="body2">{form.manuscript.name}</Typography>}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ backgroundColor: PRIMARY_COLOR, mt: 2 }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Submit Book'}
          </Button>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Button
            variant="text"
            sx={{ mt: 2, color: PRIMARY_COLOR }}
            onClick={() => navigate('/profile')}
          >
            Back to Profile
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default AuthorSubmission;
