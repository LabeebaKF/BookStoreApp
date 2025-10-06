import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Grid, Paper, Typography, Button, Box, Divider, Rating, CircularProgress, TextField, List, ListItem, ListItemText 
} from '@mui/material';
import { ShoppingCart, FlashOn, Star } from '@mui/icons-material';

const API_BASE = 'http://localhost:3000/api/books/';
const PRIMARY_COLOR = '#239c78ff';
const CONTENT_HEADING_COLOR = '#1e8667ff';

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}${id}`);
        if (!res.ok) throw new Error(`Failed to fetch book (status: ${res.status})`);
        const data = await res.json();
        setBook(data);

        const allRes = await fetch(`${API_BASE}all`);
        if (allRes.ok) {
          const allBooks = await allRes.json();
          const similar = allBooks.filter(
            b => (b.genre === data.genre || b.author === data.author) && b._id !== id
          );
          setSimilarBooks(similar);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load book details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const handleAddToCart = () => {
    const token = localStorage.getItem('usertoken');
    if (!token) return alert('Please log in to add books to cart.');
    alert('Book added to cart!');
  };

  const handleSubmitReview = async () => {
    if (!rating || !reviewText.trim()) return alert("Please give a rating and write a review.");
    const token = localStorage.getItem('usertoken');
    if (!token) return alert("Please log in to submit a review.");

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, review: reviewText })
      });
      if (!res.ok) throw new Error("Failed to submit review");
      const newReview = await res.json();

      setBook(prev => ({
        ...prev,
        reviews: [...(prev.reviews || []), newReview]
      }));

      setRating(0);
      setReviewText('');
    } catch (err) {
      console.error(err);
      alert("Error submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Container maxWidth="lg" sx={{ textAlign: 'center', py: 20 }}>
      <CircularProgress sx={{ color: PRIMARY_COLOR }} />
      <Typography variant="h6" mt={2}>Loading Book Details...</Typography>
    </Container>
  );

  if (error || !book) return (
    <Container maxWidth="lg" sx={{ textAlign: 'center', py: 10, color: 'red' }}>
      <Typography variant="h5">{error || 'Book not found.'}</Typography>
    </Container>
  );

  const isAvailable = book.stock > 0;

  //rating summary calculation
  const reviewSummary = [5,4,3,2,1].map(star => ({
    star,
    count: book.reviews?.filter(r => r.rating === star).length || 0
  }));
  const totalReviews = book.reviews?.length || 0;
  const averageRating = totalReviews ? (book.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: 4 ,backgroundColor:"rgba(215, 218, 214, 0.86)"}}>
        <Grid container spacing={4} alignItems="flex-start">
          {/* LEFT COLUMN */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              component="img"
              src={book.imageUrl || 'https://via.placeholder.com/300x450'}
              alt={book.title}
              sx={{ width: '100%', maxWidth: 300, height: 450, objectFit: 'cover', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            />
            <Box mt={3} display="flex" flexDirection="column" gap={2} width="100%">
              <Button
                variant="contained"
                startIcon={<FlashOn />}
                disabled={!isAvailable}
                fullWidth
                sx={{ backgroundColor: isAvailable ? '#22aa76ff' : '#bdbdbd', color: '#fff', py: 1.5 }}
                onClick={() => navigate(`/order/${book._id}`)}
              >
                Buy Now
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShoppingCart />}
                disabled={!isAvailable}
                fullWidth
                sx={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR, py: 1.5 }}
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </Box>
          </Grid>

         
          <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: CONTENT_HEADING_COLOR }}>{book.title}</Typography>
            <Typography variant="h6" color="text.secondary" mb={2}>by {book.author}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600,color:"rgba(88, 88, 92, 0.89)" }} gutterBottom>Description</Typography>
            <Typography variant="body1" paragraph>{book.description}</Typography> 

            <Divider sx={{ my: 2 }} />  

            <Grid container spacing={2} mb={3}>
              <Grid item xs={6}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>Genre:</Typography>
                <Typography variant="body2" color="text.secondary">{book.genre}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>Published:</Typography>
                <Typography variant="body2" color="text.secondary">{book.publicationYear || 'N/A'}</Typography>
              </Grid>
            </Grid>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#108a84ff' }}>₹{book.price}</Typography>
            <Typography variant="subtitle1" sx={{ color: isAvailable ? PRIMARY_COLOR : '#dc3545', fontWeight: 600, mb:2 }}>
              {isAvailable ? `In Stock (${book.stock})` : 'Out of Stock'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" alignItems="center" mb={2} gap={1}>
              <Rating
                name="book-rating"
                value={averageRating}
                readOnly
                precision={0.5}
                sx={{ color: '#FFD700' }}
                emptyIcon={<Star style={{ opacity: 0.3 }} fontSize="inherit" />}
              />
              <Typography variant="body2" color="text.primary">
                {averageRating.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
              </Typography>
            </Box>
          </Grid>
        </Grid>

        
        <Box mt={5}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: CONTENT_HEADING_COLOR }}>Review Summary</Typography>
          {reviewSummary.map(r => (
            <Box key={r.star} display="flex" alignItems="center" gap={1} mb={0.5}>
              <Rating
                value={r.star}
                readOnly
                size="small"
                sx={{ color: '#FFD700' }}
                emptyIcon={<Star style={{ opacity: 0.3 }} fontSize="inherit" />}
              />
              <Typography variant="body2">{r.count} review{r.count !== 1 ? 's' : ''}</Typography>
            </Box>
          ))}
        </Box>

        <Box mt={5}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: CONTENT_HEADING_COLOR }} gutterBottom>
            Write a Review
          </Typography>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <Rating
              name="user-rating"
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
            />
            <TextField
              label="Your Review"
              multiline
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              sx={{ backgroundColor: PRIMARY_COLOR, color: '#fff' }}
              onClick={handleSubmitReview}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </Box>

          {book.reviews && book.reviews.length > 0 && (
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>All Reviews</Typography>
              <List>
                {book.reviews.map((r, idx) => (
                  <ListItem key={idx} alignItems="flex-start">
                    <ListItemText
                      primary={<Rating value={r.rating} readOnly size="small" sx={{ color: '#FFD700' }} />}
                      secondary={r.review}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>

        {similarBooks.length > 0 && (
          <Box mt={5}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: CONTENT_HEADING_COLOR }} gutterBottom>
              Similar Books
            </Typography>
            <Grid container spacing={3}>
              {similarBooks.map(sim => (
                <Grid item key={sim._id} xs={6} sm={4} md={2}>
                  <Paper
                    elevation={1}
                    sx={{ p: 1, textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => navigate(`/book/${sim._id}`)}
                  >
                    <Box
                      component="img"
                      src={sim.imageUrl || 'https://via.placeholder.com/150'}
                      alt={sim.title}
                      sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 1 }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{sim.title}</Typography>
                    <Typography variant="caption" color="text.secondary">by {sim.author}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Details;
