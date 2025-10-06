import { 
    Box, 
    Card, 
    CardContent, 
    CardMedia, 
    CircularProgress, 
    Container, 
    Grid, 
    Typography, 
    Button, 
    TextField, 
    InputAdornment 
} from '@mui/material';
import { Rating } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PRIMARY_COLOR = 'rgba(27, 136, 100, 1)';

const BookCard = ({ book, onAddToCart, onViewDetails }) => {
    const totalReviews = book.reviews?.length || 0;
    const avgRating = totalReviews ? (book.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) : 0;

    return (
        <Card 
            sx={{ 
                height: 550, 
                display: 'flex', 
                flexDirection: 'column',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                transition: '0.3s',
                '&:hover': { boxShadow: '0 8px 16px rgba(0,0,0,0.2)', transform: 'translateY(-3px)' },
            }}
        >
            <CardMedia
                component="img"
                sx={{ height: 300, objectFit: 'cover', borderBottom: '1px solid #eee' }}
                image={book.imageUrl || 'https://via.placeholder.com/150x220?text=No+Cover'}
                alt={book.title}
                onClick={() => onViewDetails(book._id)}
                style={{ cursor: "pointer" }}
            />
            <CardContent sx={{ flexGrow: 1, paddingBottom: 1 }}>
                <Box sx={{ minHeight: 65, mb: 1 }}>
                    <Typography gutterBottom variant="h6" noWrap>{book.title}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{book.author}</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: PRIMARY_COLOR }}>
                    ₹{book.price ? book.price.toFixed(2) : 'N/A'}
                </Typography>
                <Box display="flex" alignItems="center" mt={1} gap={1}>
                    <Rating 
                        value={avgRating} 
                        readOnly 
                        size="small" 
                        precision={0.5} 
                        sx={{ color: '#FFD700' }}
                        emptyIcon={<span style={{ opacity: 0.3 }}>★</span>}
                    />
                    <Typography variant="body2" color="text.primary">
                        {avgRating.toFixed(1)} 
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        ({totalReviews})
                    </Typography>
                </Box>
            </CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2, paddingTop: 0 }}>
                <Button 
                    variant="contained" 
                    sx={{ backgroundColor: PRIMARY_COLOR, width: '100%', height: '35px', '&:hover': { backgroundColor: PRIMARY_COLOR } }}
                    size="small"
                    onClick={() => onAddToCart(book._id)}
                >
                    Add to Cart
                </Button>
            </Box>
        </Card>
    );
};

const Books = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllBooks = async () => {
            setLoading(true);
            setError(null); 
            try {
                const response = await fetch('http://localhost:3000/api/books/all');
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setBooks(data);
            } catch (err) {
                console.error("Error fetching all books:", err);
                setError('Failed to load the complete book list. Please check your backend server connection.');
                setBooks([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAllBooks(); 
    }, []); 

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const booksToDisplay = searchTerm ? filteredBooks : books;

    //Add to Cart
    const handleAddToCart = async (bookId) => {
        const token = localStorage.getItem('usertoken') || localStorage.getItem('token');
        if (!token) {
            alert("Please login first to add books to cart.");
            navigate("/login");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/user/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ bookId, quantity: 1 }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Book added to cart successfully!");
                console.log("Cart update:", data);
            } else {
                alert(data.message || "Failed to add to cart.");
                console.error("Cart error:", data);
            }
        } catch (err) {
            console.error("Error adding to cart:", err);
            alert("Server error while adding to cart.");
        }
    };

    const handleViewDetails = (bookId) => { navigate(`/book/${bookId}`); };
    const handleSearchChange = (event) => setSearchTerm(event.target.value);
    const handleSearchSubmit = (event) => event.preventDefault();

    return (
        <Box sx={{ minHeight: '100vh', py: 4, backgroundColor:"rgba(215, 218, 214, 0.86)", width:"100vw" }}> 
            <Container maxWidth="lg">
                <Box component="form" onSubmit={handleSearchSubmit} sx={{ my: 4 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by Title, Author, or ISBN..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Typography component="span" sx={{ color: PRIMARY_COLOR, fontSize: '1.5rem', mr: 1 }}>🔍</Typography>
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Button 
                                        type="submit" 
                                        variant="contained" 
                                        sx={{ height: '56px', borderRadius: '0 4px 4px 0', backgroundColor: PRIMARY_COLOR, '&:hover': { backgroundColor: PRIMARY_COLOR } }}
                                    >
                                        Search
                                    </Button>
                                </InputAdornment>
                            ),
                            style: { paddingRight: 0, backgroundColor: 'white' } 
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { paddingRight: 0 } }}
                    />
                </Box>

                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: PRIMARY_COLOR, mb: 4, textAlign: 'center' }}>
                    Complete Book Collection 
                </Typography>

                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress sx={{ color: PRIMARY_COLOR }} /></Box>}
                {error && !loading && <Typography color="error" align="center" sx={{ my: 4 }}>{error}</Typography>}

                {!loading && booksToDisplay.length > 0 && (
                    <Grid container spacing={3}> 
                        {booksToDisplay.map((book) => (
                            <Grid item key={book._id} xs={6} sm={4} md={3} sx={{ '@media (min-width: 1200px)': { flexBasis: '20%', maxWidth: '18%', boxSizing: 'border-box', borderRadius: '15px', boxShadow: '0 4px 9px rgba(0.1,0.1,0.1,0.3)' } }}>
                                <BookCard book={book} onAddToCart={handleAddToCart} onViewDetails={handleViewDetails} />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {booksToDisplay.length === 0 && !loading && !error && (
                    <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                        The collection is currently empty.
                    </Typography>
                )}
            </Container>
        </Box>
    );
};

export default Books;
