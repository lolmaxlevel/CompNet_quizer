// src/app/api/fdb-data/route.tsx
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Add this line to make the route compatible with static exports
export const dynamic = 'force-static';

export async function GET() {
  try {
    // Path to your XML file
    const filePath = path.join(process.cwd(), 'public', 'data', 'КС25_Т1в33.fdb');

    // Read XML file (you'll need to upload this file to your Next.js project)
    const xmlContent = fs.readFileSync(filePath, "latin1");

    return new NextResponse(xmlContent, {
      headers: {
        'Content-Type': 'plain/text'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error loading XML data' },
      { status: 500 }
    );
  }
}