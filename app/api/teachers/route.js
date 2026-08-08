import { NextResponse } from 'next/server';
import connectDb from '../../../lib/mongodb';
import Teacher from '../../../models/Teacher';

const normalizeCaseValue = (value) => String(value || '').trim().toLowerCase();

export async function GET() {
  try {
    await connectDb();
    const teachers = await Teacher.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ teachers });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Something Went Wrong' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDb();
    const body = await request.json();

    const payload = {
      name: String(body.name || '').trim(),
      fbWapp: String(body.fbWapp || '').trim(),
      varsity: String(body.varsity || '').trim(),
      phone: String(body.phone || '').trim(),
      location: normalizeCaseValue(body.location),
      tag: normalizeCaseValue(body.tag),
    };

    if (!payload.name || !payload.fbWapp || !payload.varsity || !payload.phone || !payload.location || !payload.tag) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    const teacher = await Teacher.create({
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ teacher }, { status: 201 });
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
      return NextResponse.json({ message: 'Invalid teacher id' }, { status: 400 });
    }

    const teacher = await Teacher.findByIdAndUpdate(
      id,
      {
        name: String(body.name || '').trim(),
        fbWapp: String(body.fbWapp || '').trim(),
        varsity: String(body.varsity || '').trim(),
        phone: String(body.phone || '').trim(),
        location: normalizeCaseValue(body.location),
        tag: normalizeCaseValue(body.tag),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!teacher) {
      return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ teacher });
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
      return NextResponse.json({ message: 'Invalid teacher id' }, { status: 400 });
    }

    const teacher = await Teacher.findByIdAndDelete(id);

    if (!teacher) {
      return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Something Went Wrong' }, { status: 400 });
  }
}
