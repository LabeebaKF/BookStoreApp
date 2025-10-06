import { 
    Box, Button, Card, CardContent, CardMedia, CircularProgress, 
    Container, IconButton, InputAdornment, TextField, Typography 
} from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PRIMARY_COLOR = 'rgba(27, 136, 100, 1)';

const BookCard = ({ book, onAddToCart, onViewDetails }) => (
    <Card 
        sx={{ 
            height: 550,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            transition: '0.3s',
            '&:hover': { boxShadow: '0 8px 16px rgba(0,0,0,0.4)', transform: 'translateY(-3px)' },
            width: '100%',  
            minWidth: 0
        }}
        onClick={() => onViewDetails(book._id)}
    >
        <CardMedia
            component="img"
            sx={{ height: 300, objectFit: 'cover', borderBottom: '1px solid #eee' }}
            image={book.imageUrl || 'https://via.placeholder.com/150x220?text=No+Cover'}
            alt={book.title}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 1 }}>
            <Box sx={{ minHeight: 65, mb: 1 }}>
                <Typography gutterBottom variant="h6" noWrap>{book.title}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{book.author}</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: PRIMARY_COLOR }}>
                ₹{book.price ? book.price.toFixed(2) : 'N/A'}
            </Typography>
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


const Category = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const genreFilter = params.get('genre');

    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('http://localhost:5500/api/books/genres');
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        };
        fetchCategories();
    }, []);

    //fetch books based on genre
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = genreFilter 
                    ? `http://localhost:5500/api/books/bygenre?genre=${genreFilter}`
                    : 'http://localhost:5500/api/books/featured';
                
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setBooks(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load books.');
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, [genreFilter]);

    const handleCategoryClick = (category) => {
        navigate(`/category?genre=${category}`);
    };

    const handleAddToCart = async (bookId) => {
        const usertoken = localStorage.getItem('usertoken');
        if (!usertoken) return alert('Please log in to add books to your wishlist.');
        try {
            const response = await fetch('http://localhost:5500/user/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${usertoken}` },
                body: JSON.stringify({ bookId }),
            });
            const data = await response.json();
            alert(response.ok ? 'Successfully added to Wishlist!' : `Error: ${data.message}`);
        } catch (err) { console.error(err); alert('Network error.'); }
    };

    const handleViewDetails = (bookId) => navigate(`/book/${bookId}`);

    const booksToDisplay = searchTerm
        ? books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase()))
        : books;

    return (
        <Box sx={{ minHeight: '100vh', width:"100vw", py: 4, backgroundColor:"rgba(215, 218, 214, 0.86)" }}>
            <Container maxWidth="lg">
              
                <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ my: 4 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by Title or Author..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">🔍</InputAdornment>,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Button type="submit" variant="contained" sx={{ height: '56px', backgroundColor: PRIMARY_COLOR, '&:hover': { backgroundColor: PRIMARY_COLOR } }}>
                                        Search
                                    </Button>
                                </InputAdornment>
                            ),
                            style: { backgroundColor: 'white' }
                        }}
                    />
                </Box>

                <Box sx={{ my: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Categories</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {categories.map(cat => (
                            <Button key={cat} variant={cat === genreFilter ? 'contained' : 'outlined'} 
                                sx={{ backgroundColor: cat === genreFilter ? PRIMARY_COLOR : 'white', color: cat === genreFilter ? 'white' : PRIMARY_COLOR }}
                                onClick={() => handleCategoryClick(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </Box>
                </Box>

            
                <Box sx={{
                    my: 4,
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',      
                        sm: 'repeat(2, 1fr)',  
                        md: 'repeat(3, 1fr)',  
                        lg: 'repeat(4, 1fr)'  
                    },
                    gap: 3,
                }}>
                    {loading && <CircularProgress sx={{ color: PRIMARY_COLOR, justifySelf: 'center' }} />}
                    {error && <Typography color="error" sx={{ gridColumn: '1 / -1' }}>{error}</Typography>}
                    {!loading && booksToDisplay.length === 0 && (
                        <Typography variant="h6" sx={{ gridColumn: '1 / -1' }}>No books available in this category.</Typography>
                    )}
                    {!loading && booksToDisplay.map(book => (
                        <BookCard key={book._id} book={book} onAddToCart={handleAddToCart} onViewDetails={handleViewDetails} />
                    ))}
                </Box>
            </Container>
        </Box>
    );
};

export default Category;
