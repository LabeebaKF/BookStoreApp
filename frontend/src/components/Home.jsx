import { 
    Box, Button, Card, CardContent, CardMedia, CircularProgress, 
    Container, IconButton, InputAdornment, TextField, Typography 
} from '@mui/material';
import { Rating } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../axiosinterceptor';
import { useNavigate, useLocation } from 'react-router-dom';

const PRIMARY_COLOR = 'rgba(27, 136, 100, 1)';

const BookCard = ({ book, onAddToCart, onViewDetails }) => {
    const totalReviews = book.reviews?.length || 0;
    const avgRating = totalReviews ? (book.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) : 0;

    return (
        <Card 
            sx={{ 
                height: 550, display: 'flex', flexDirection: 'column',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                transition: '0.3s', '&:hover': { boxShadow: '0 8px 16px rgba(0,0,0,0.4)', transform: 'translateY(-3px)' },
                mr: 3, cursor: 'pointer'
            }}
            onClick={() => onViewDetails(book._id)}
        >
            <CardMedia
                component="img"
                sx={{ height: 300, objectFit: 'cover', borderBottom: '1px solid #eee' }}
                image={book.imageUrl || 'https://via.placeholder.com/150x220?text=No+Cover'}
                alt={book.title}
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
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2, paddingTop: 0, gap: 1 }}
                 onClick={(e) => e.stopPropagation()}>
                <Button 
                    variant="contained" 
                    sx={{ backgroundColor: PRIMARY_COLOR, width: '100%', height: '35px', '&:hover': { backgroundColor: PRIMARY_COLOR } }}
                    size="small"
                    onClick={() => onAddToCart(book._id)} 
                >
                    Add to Cart
                </Button>
                <IconButton sx={{ color: PRIMARY_COLOR }} onClick={() => onViewDetails(book._id)} aria-label="view details" />
            </Box>
        </Card>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const genreFilter = params.get('genre');

    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showViewAll, setShowViewAll] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = '/api/books/featured';
                if (genreFilter) url = `/api/books/bygenre?genre=${genreFilter}`;
                
                const response = await axiosInstance.get(url);
                const data = response.data;
                setBooks(data);
            } catch (err) {
                console.error("Error fetching books:", err);
                setError('Failed to load books. Please check server connection.');
                setBooks([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks(); 
    }, [genreFilter]);

    const handleScroll = () => {
        if (scrollRef.current && !searchTerm) {
            const container = scrollRef.current;
            setShowViewAll(container.scrollWidth > container.clientWidth && container.scrollLeft > 10);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (e.target.value) setShowViewAll(false);
    };

    const handleAddToCart = async (bookId) => {
        const usertoken = localStorage.getItem('usertoken');
        if (!usertoken) return alert('Please log in to add books to cart.');
        try {
            const response = await axiosInstance.post('/api/user/cart', { bookId });
            const data = response.data;
            if (response.status === 200) {
                alert('Successfully added to Cart!');
            } else {
                alert(`Error: ${data.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert(`Network error: ${err.response?.data?.message || 'Please check your connection'}`);
        }
    };

    const handleViewDetails = (bookId) => navigate(`/book/${bookId}`);

    const booksToDisplay = searchTerm
        ? books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase()))
        : books;

    return (
        <Box sx={{ minHeight: '100vh', width:"100vw", py: 4, backgroundColor:"rgba(215, 218, 214, 0.86)" }}>
            <Container maxWidth="lg" disableGutters>
                <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ my: 4 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by Title, Author, or ISBN..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Typography sx={{ color: PRIMARY_COLOR, fontSize: '1.5rem', mr: 1 }}>🔍</Typography>
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Button type="submit" variant="contained" sx={{ height: '56px', borderRadius: '0 4px 4px 0', backgroundColor: PRIMARY_COLOR, '&:hover': { backgroundColor: PRIMARY_COLOR } }}>
                                        Search
                                    </Button>
                                </InputAdornment>
                            ),
                            style: { paddingRight: 0, backgroundColor: 'white' }
                        }}
                    />
                </Box>

                <Box sx={{ my: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: PRIMARY_COLOR }}>
                            {searchTerm ? `Search Results (${booksToDisplay.length})` : (genreFilter ? `${genreFilter.charAt(0).toUpperCase() + genreFilter.slice(1)} Books` : "Featured Books")}
                        </Typography>
                        {!searchTerm && showViewAll && (
                            <Button variant="outlined" onClick={() => navigate('/allbooks')} sx={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}>
                                View All
                            </Button>
                        )}
                    </Box>

                    {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress sx={{ color: PRIMARY_COLOR }} /></Box>}

                    {error && !loading && <Typography color="error" align="center" sx={{ my: 4 }}>{error}</Typography>}

                    {!loading && booksToDisplay.length > 0 && (
                        <Box ref={scrollRef} onScroll={handleScroll} sx={{ display: 'flex', overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' }, py: 1 }}>
                            {booksToDisplay.map((book) => (
                                <Box key={book._id} sx={{ minWidth: { xs: '70%', sm: '50%', md: '33.33%', lg: '20%' }, boxSizing:"border-box", borderRadius:"15px", boxShadow:"0 4px 9px rgba(0.1,0.1,0.1,0.3)" }}>
                                    <BookCard book={book} onAddToCart={handleAddToCart} onViewDetails={handleViewDetails} />
                                </Box>
                            ))}
                        </Box>
                    )}

                    {!loading && booksToDisplay.length === 0 && (
                        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                            {searchTerm ? `No books found matching "${searchTerm}".` : 'No books available for this category.'}
                        </Typography>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default Home;
