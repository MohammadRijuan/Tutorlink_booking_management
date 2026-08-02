import { NextResponse } from 'next/server';
import connectDb from '../../../lib/mongodb';
import { CashEntry, CostEntry } from '../../../models/CashFlow';

const getModelByType = (type) => {
  if (type === 'cash') return CashEntry;
  if (type === 'cost') return CostEntry;
  return null;
};

export async function GET() {
  try {
    await connectDb();

    const cashEntries = await CashEntry.find({}).sort({ createdAt: -1 }).lean();
    const costEntries = await CostEntry.find({}).sort({ createdAt: -1 }).lean();

    const entries = [
      ...cashEntries.map((entry) => ({ ...entry, type: 'cash' })),
      ...costEntries.map((entry) => ({ ...entry, type: 'cost' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json({ message: 'Something Went Wrong' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDb();
    const body = await request.json();

    if (!body.title || !body.amount || Number(body.amount) <= 0 || !body.type) {
      return NextResponse.json({ message: 'Invalid cash flow data' }, { status: 400 });
    }

    const Model = getModelByType(body.type);

    if (!Model) {
      return NextResponse.json({ message: 'Invalid entry type' }, { status: 400 });
    }

    const entry = await Model.create({
      title: body.title,
      amount: Number(body.amount),
      createdAt: new Date(),
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Something Went Wrong' }, { status: 400 });
  }
}

export async function PATCH(request) {
  try {
    await connectDb();
    const body = await request.json();
    const { id, title, amount, type } = body;

    if (!id || !title || !amount || Number(amount) <= 0 || !type) {
      return NextResponse.json({ message: 'Invalid cash flow data' }, { status: 400 });
    }

    const Model = getModelByType(type);

    if (!Model) {
      return NextResponse.json({ message: 'Invalid entry type' }, { status: 400 });
    }

    const entry = await Model.findByIdAndUpdate(
      id,
      { title, amount: Number(amount) },
      { new: true }
    );

    if (!entry) {
      return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Something Went Wrong' }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    await connectDb();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const type = url.searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ message: 'Invalid cash flow id or type' }, { status: 400 });
    }

    const Model = getModelByType(type);

    if (!Model) {
      return NextResponse.json({ message: 'Invalid entry type' }, { status: 400 });
    }

    const entry = await Model.findByIdAndDelete(id);

    if (!entry) {
      return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Something Went Wrong' }, { status: 400 });
  }
}
