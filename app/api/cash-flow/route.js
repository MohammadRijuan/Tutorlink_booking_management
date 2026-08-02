import { NextResponse } from 'next/server';
import connectDb from '../../../lib/mongodb';
import CashFlow from '../../../models/CashFlow';

export async function GET() {
  try {
    await connectDb();
    const entries = await CashFlow.find({}).sort({ createdAt: -1 }).lean();
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

    const entry = await CashFlow.create({
      type: body.type,
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

    const entry = await CashFlow.findByIdAndUpdate(
      id,
      { title, amount: Number(amount), type },
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

    if (!id) {
      return NextResponse.json({ message: 'Invalid cash flow id' }, { status: 400 });
    }

    const entry = await CashFlow.findByIdAndDelete(id);

    if (!entry) {
      return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Something Went Wrong' }, { status: 400 });
  }
}
