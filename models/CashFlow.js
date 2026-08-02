import mongoose from 'mongoose';

const cashFlowSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['cash', 'cost'],
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

const CashFlow = mongoose.models.CashFlow || mongoose.model('CashFlow', cashFlowSchema);

export default CashFlow;
