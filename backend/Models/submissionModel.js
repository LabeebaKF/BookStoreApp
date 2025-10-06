const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    authorName: { type: String, required: true },
    synopsis: { type: String, required: true },
    manuscriptUrl: { type: String },
    coverUrl: { type: String }, 
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'userdetails', required: true },
    submissionDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('submissions', submissionSchema);
