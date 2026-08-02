import mongoose from 'mongoose';

const baseEntrySchema = {
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
};

const cashEntrySchema = new mongoose.Schema(baseEntrySchema, { timestamps: false });
const costEntrySchema = new mongoose.Schema(baseEntrySchema, { timestamps: false });

export const CashEntry = mongoose.models.CashEntry || mongoose.model('CashEntry', cashEntrySchema, 'cashentries');
export const CostEntry = mongoose.models.CostEntry || mongoose.model('CostEntry', costEntrySchema, 'costentries');

const CashFlow = { CashEntry, CostEntry };

export default CashFlow;
