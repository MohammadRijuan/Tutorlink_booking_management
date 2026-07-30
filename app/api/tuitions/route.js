import { NextResponse } from 'next/server';
import connectDb from '../../../lib/mongodb';
import Tuition from '../../../models/Tuition';

export async function GET() {
  try {
    await connectDb();
    const tuitions = await Tuition.find({}).lean();
    const updates = [];

    tuitions.forEach((tuition) => {
      const shouldUpdateBooking = tuition.bookingStatus === 'Booked' && !tuition.bookingDate;
      const shouldUpdateExpiry = tuition.bookingStatus === 'Booked' && !tuition.feeExpiryDate;

      if (shouldUpdateBooking || shouldUpdateExpiry) {
        const bookingDate = tuition.bookingDate ? new Date(tuition.bookingDate) : new Date(tuition.createdAt || new Date());
        const feeExpiryDate = new Date(bookingDate);
        feeExpiryDate.setMonth(feeExpiryDate.getMonth() + 1);

        const update = {};
        if (shouldUpdateBooking) update.bookingDate = bookingDate;
        if (shouldUpdateExpiry) update.feeExpiryDate = feeExpiryDate;
        updates.push({ updateOne: { filter: { _id: tuition._id }, update: { $set: update } } });

        tuition.bookingDate = bookingDate;
        tuition.feeExpiryDate = feeExpiryDate;
      }
    });

    if (updates.length > 0) {
      await Tuition.bulkWrite(updates);
    }

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
    const createdAt = new Date();
    const bookingDate = body.bookingStatus === 'Booked' ? createdAt : null;
    const feeExpiryDate = bookingDate ? new Date(new Date(bookingDate).setMonth(new Date(bookingDate).getMonth() + 1)) : null;

    const tuition = await Tuition.create({
      ...body,
      bookingDate,
      feeExpiryDate,
      createdAt,
      updatedAt: createdAt,
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

    const existingTuition = await Tuition.findById(id);
    if (!existingTuition) {
      return NextResponse.json({ message: 'Tuition not found' }, { status: 404 });
    }

    const bookingDate = body.bookingStatus === 'Booked'
      ? existingTuition.bookingDate || new Date(existingTuition.createdAt || new Date())
      : existingTuition.bookingDate || null;
    const feeExpiryDate = bookingDate ? new Date(new Date(bookingDate).setMonth(new Date(bookingDate).getMonth() + 1)) : null;

    const tuition = await Tuition.findByIdAndUpdate(
      id,
      { ...body, id: undefined, bookingDate, feeExpiryDate, updatedAt: new Date() },
      { new: true }
    );

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
