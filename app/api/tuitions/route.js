import { NextResponse } from 'next/server';
import connectDb from '../../../lib/mongodb';
import Tuition from '../../../models/Tuition';

export async function GET() {
  try {
    await connectDb();
    const tuitions = await Tuition.find({}).lean();

    tuitions.sort((a, b) => {
      const aCode = Number.parseInt(a.tuitionCode, 10);
      const bCode = Number.parseInt(b.tuitionCode, 10);
      const aNumber = Number.isNaN(aCode) ? Number.MAX_SAFE_INTEGER : aCode;
      const bNumber = Number.isNaN(bCode) ? Number.MAX_SAFE_INTEGER : bCode;

      if (aNumber !== bNumber) {
        return aNumber - bNumber;
      }

      return String(a.tuitionCode).localeCompare(String(b.tuitionCode));
    });

    return NextResponse.json({ tuitions });
  } catch (error) {
    return NextResponse.json({ message: 'Something Went Wrong' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDb();
    const body = await request.json();
    const tuition = await Tuition.create({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ tuition }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Something Went Wrong' }, { status: 400 });
  }
}

export async function PATCH(request) {
  try {
    await connectDb();
    const body = await request.json();
    const id = body?.id;

    if (!id) {
      return NextResponse.json({ message: 'Invalid tuition id' }, { status: 400 });
    }

    const tuition = await Tuition.findByIdAndUpdate(
      id,
      { ...body, id: undefined, updatedAt: new Date() },
      { new: true }
    );

    if (!tuition) {
      return NextResponse.json({ message: 'Tuition not found' }, { status: 404 });
    }

    return NextResponse.json({ tuition });
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
      return NextResponse.json({ message: 'Invalid tuition id' }, { status: 400 });
    }

    const tuition = await Tuition.findByIdAndDelete(id);

    if (!tuition) {
      return NextResponse.json({ message: 'Tuition not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Something Went Wrong' }, { status: 400 });
  }
}
