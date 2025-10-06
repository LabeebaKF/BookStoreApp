const express = require('express');
const router = express.Router();
const Submission = require('../Models/submissionModel');
const User = require('../Models/userModel');
const { verifyToken, authAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + ext);
  }
});
const upload = multer({ storage });

//create a new submission
router.post('/', verifyToken, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'manuscript', maxCount: 1 }
]), async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ message: 'Only users can publish books' });
    }

    const { title, synopsis, genre, authorName } = req.body;
    if (!title || !synopsis) return res.status(400).json({ message: 'Title and synopsis are required' });

    let finalAuthorName = authorName || null;
    if (!finalAuthorName && req.userId) {
      const u = await User.findById(req.userId);
      finalAuthorName = u ? u.username : 'Unknown';
    }

    let coverUrl = req.body.coverUrl || '';
    let manuscriptUrl = req.body.manuscriptUrl || '';

    if (req.files) {
      if (req.files.coverImage?.[0]) {
        coverUrl = `${req.protocol}://${req.get('host')}/uploads/${req.files.coverImage[0].filename}`;
      }
      if (req.files.manuscript?.[0]) {
        manuscriptUrl = `${req.protocol}://${req.get('host')}/uploads/${req.files.manuscript[0].filename}`;
      }
    }

    const submission = new Submission({
      title,
      synopsis,
      genre: genre || '',
      coverUrl,
      manuscriptUrl,
      authorName: finalAuthorName || 'Unknown',
      submittedBy: req.userId,
      status: 'Pending'
    });

    await submission.save();
    res.status(201).json({ message: 'Submission created', submission });

  } catch (err) {
    console.error('Create submission error:', err);
    res.status(500).json({ message: 'Server error creating submission', error: err.message });
  }
});

//get submission for user
router.get('/my', verifyToken, async (req, res) => {
  try {
    const submissions = await Submission.find({ submittedBy: req.userId }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error('Get my submissions error:', err);
    res.status(500).json({ message: 'Server error fetching submissions' });
  }
});

//get submission
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    if (submission.submittedBy.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(submission);
  } catch (err) {
    console.error('Get submission error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


//admin review submission and publish book
router.get('/all', verifyToken, authAdmin, async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error('Get all submissions error:', err);
    res.status(500).json({ message: 'Server error fetching submissions' });
  }
});

//update submission
router.put('/:id', verifyToken, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'manuscript', maxCount: 1 }
]), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.submittedBy.toString() !== req.userId) return res.status(403).json({ message: 'Access denied' });
    if (submission.status === 'Approved') return res.status(400).json({ message: 'Cannot edit approved submission' });

    const { title, synopsis, genre, status } = req.body;
    if (title) submission.title = title;
    if (synopsis) submission.synopsis = synopsis;
    if (genre) submission.genre = genre;
    if (status) submission.status = status;

    if (req.files) {
      if (req.files.coverImage?.[0]) submission.coverUrl = `${req.protocol}://${req.get('host')}/uploads/${req.files.coverImage[0].filename}`;
      if (req.files.manuscript?.[0]) submission.manuscriptUrl = `${req.protocol}://${req.get('host')}/uploads/${req.files.manuscript[0].filename}`;
    }

    await submission.save();
    res.json({ message: 'Submission updated', submission });
  } catch (err) {
    console.error('Update submission error:', err);
    res.status(500).json({ message: 'Server error updating submission' });
  }
});

//delete submission
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.submittedBy.toString() !== req.userId && req.userRole !== 'admin') return res.status(403).json({ message: 'Access denied' });
    if (submission.status === 'Approved') return res.status(400).json({ message: 'Cannot delete approved submission' });

    await submission.remove();
    res.json({ message: 'Submission deleted' });
  } catch (err) {
    console.error('Delete submission error:', err);
    res.status(500).json({ message: 'Server error deleting submission' });
  }
});


module.exports = router;
