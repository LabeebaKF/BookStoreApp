const express = require('express');
const router = express.Router();
const Book = require('../Models/bookModel');
const { verifyToken } = require('../middleware/auth');

//get featured books
router.get('/featured', async (req, res) => {
    try {
        const books = await Book.find({ isFeatured: true }).limit(8);
        res.status(200).json(books);
    } catch (error) {
        console.error('Error fetching featured books:', error);
        res.status(500).json({ message: 'Server error while fetching featured books.' });
    }
});

//get all books
router.get('/all', async (req, res) => {
    try {
        const books = await Book.find({});
        res.status(200).json(books);
    } catch (error) {
        console.error('Error fetching all books:', error);
        res.status(500).json({ message: 'Server error while fetching all books.' });
    }
});

//get genre
router.get('/genres', async (req, res) => {
    try {
        const allBooks = await Book.find({}, 'genre');
        const genreSet = new Set();
        allBooks.forEach(book => {
            if (book.genre && typeof book.genre === 'string') {
                book.genre.split(/,| and /i).forEach(g => genreSet.add(g.trim()));
            }
        });
        res.status(200).json([...genreSet].sort());
    } catch (err) {
        console.error('Error fetching genres:', err);
        res.status(500).json({ message: 'Failed to fetch genres', error: err.message });
    }
});

//get by genre
router.get('/bygenre', async (req, res) => {
    try {
        const genre = req.query.genre;
        if (!genre) return res.status(400).json({ message: 'Genre query parameter is required' });

        const books = await Book.find({ genre: { $regex: new RegExp(`^${genre}$`, 'i') } });
        res.status(200).json(books);
    } catch (err) {
        console.error('Error fetching books by genre:', err);
        res.status(500).json({ message: 'Failed to fetch books by genre', error: err.message });
    }
});

//get similar books
router.get('/similar/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        const similarBooks = await Book.find({
            _id: { $ne: book._id },
            $or: [
                { genre: book.genre },
                { author: book.author }
            ]
        }).limit(8);

        res.status(200).json(similarBooks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching similar books' });
    }
});

//get book by id
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.status(200).json(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ message: 'Server error while fetching the book.' });
    }
});

//create book
router.post('/', async (req, res) => {
    try {
        const newBook = new Book(req.body);
        await newBook.save();
        res.status(201).json(newBook);
    } catch (error) {
        res.status(500).json({ message: 'Could not add book.', error: error.message });
    }
});

//update book
router.put('/:id', async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
        res.status(200).json(updatedBook);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Could not update book.', error: error.message });
    }
});

//delete book
router.delete('/:id', async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);
        if (!deletedBook) return res.status(404).json({ message: 'Book not found' });
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Could not delete book.', error: error.message });
    }
});
//add review
router.post('/:id/reviews', verifyToken, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const userId = req.userId;

    if (!rating || !review) return res.status(400).json({ message: 'Rating and review are required' });

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const newReview = { user: userId, rating, review };
    book.reviews.push(newReview);

    await book.save();

    res.status(201).json(newReview);
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Failed to add review', error: err.message });
  }
});

module.exports = router;
