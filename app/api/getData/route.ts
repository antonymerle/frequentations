import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const periode = "2020-2024";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dataset = searchParams.get('dataset');

  if (dataset !== 'bayonne' && dataset !== 'pau') {
    return NextResponse.json({ error: 'Invalid dataset' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'public', `${dataset}-${periode}.csv`);

  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/csv',
      },
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}

