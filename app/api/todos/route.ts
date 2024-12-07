// import { NextResponse } from 'next/server';
// import connectDB from '@/lib/dbConnect';
// import { Todo } from '@/models/ToDo';

// export async function GET() {
//   await connectDB();
//   try {
//     const todos = await Todo.find({}).sort({ createdAt: -1 });
//     return NextResponse.json({ success: true, data: todos });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 400 });
//   }
// }

// export async function POST(req: Request) {
//   await connectDB();
//   try {
//     const todo = await Todo.create(await req.json());
//     return NextResponse.json({ success: true, data: todo }, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 400 });
//   }
// }

// export async function PUT(req: Request) {
//   await connectDB();
//   try {
//     // Extract the query parameter from the URL
//     const url = new URL(req.url);
//     const id = url.searchParams.get('id');  // Get 'id' query parameter
    
//     if (!id) {
//       return NextResponse.json({ success: false, message: 'Missing todo ID' }, { status: 400 });
//     }

//     const todo = await Todo.findByIdAndUpdate(id, await req.json(), {
//       new: true,
//       runValidators: true,
//     });

//     if (!todo) {
//       return NextResponse.json({ success: false }, { status: 400 });
//     }

//     return NextResponse.json({ success: true, data: todo });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 400 });
//   }
// }

// export async function DELETE(req: Request) {
//   await connectDB();
//   try {
//     // Extract the query parameter from the URL
//     const url = new URL(req.url);
//     const id = url.searchParams.get('id');  // Get 'id' query parameter
    
//     if (!id) {
//       return NextResponse.json({ success: false, message: 'Missing todo ID' }, { status: 400 });
//     }

//     const deletedTodo = await Todo.findByIdAndDelete(id);

//     if (!deletedTodo) {
//       return NextResponse.json({ success: false }, { status: 400 });
//     }

//     return NextResponse.json({ success: true, data: {} });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 400 });
//   }
// }







import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import { Todo } from '@/models/ToDo';

export async function GET() {
  await connectDB();
  try {
    const todos = await Todo.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: todos });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  await connectDB();
  try {
    const todo = await Todo.create(await req.json());
    return NextResponse.json({ success: true, data: todo }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  await connectDB();
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing todo ID' }, { status: 400 });
    }

    const todo = await Todo.findByIdAndUpdate(id, await req.json(), {
      new: true,
      runValidators: true,
    });

    if (!todo) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: todo });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  await connectDB();
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing todo ID' }, { status: 400 });
    }

    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}