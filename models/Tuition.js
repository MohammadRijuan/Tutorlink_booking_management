import mongoose from 'mongoose';

const tuitionSchema = new mongoose.Schema(
  {
    tuitionCode: { type: String, required: true, unique: true, trim: true },
    tutorName: { type: String, required: true, trim: true },
    tutorMobile: { type: String, required: true, trim: true },
    guardianName: { type: String, required: true, trim: true },
    guardianMobile: { type: String, required: true, trim: true },
    guardianFacebook: { type: String, trim: true },
    salary: { type: Number, required: true, min: 1 },
    agencyFee: { type: Number, required: true, min: 0 },
    feeStatus: { type: String, enum: ['Pending', 'Done'], default: 'Pending' },
    bookingStatus: { type: String, enum: ['Pending', 'Booked', 'Cancelled'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const Tuition = mongoose.models.Tuition || mongoose.model('Tuition', tuitionSchema);

export default Tuition;
