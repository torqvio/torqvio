import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Create waitlist table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
  );
`;

export async function POST(request: NextRequest) {
  try {
    // Ensure table exists
    await sql.query(createTableQuery);

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Get client info for analytics
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert email into waitlist
    try {
      await sql`
        INSERT INTO waitlist (email, ip_address, user_agent)
        VALUES (${email}, ${ipAddress}, ${userAgent})
      `;
    } catch (error: any) {
      // Handle duplicate email
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { message: 'Successfully added to waitlist' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get total count
    const totalResult = await sql`
      SELECT COUNT(*) as count
      FROM waitlist
    `;
    
    const totalCount = parseInt(totalResult[0]?.count || '0');
    
    // Get recent signups (last 5)
    const recentResult = await sql`
      SELECT email, created_at, 
             CASE 
               WHEN user_agent LIKE '%iPhone%' OR user_agent LIKE '%Android%' THEN 'Mobile'
               WHEN user_agent LIKE '%Chrome%' OR user_agent LIKE '%Firefox%' OR user_agent LIKE '%Safari%' THEN 'Desktop'
               ELSE 'Other'
             end as device_type,
             ip_address
      FROM waitlist 
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    // Get daily stats for growth tracking
    const dailyStats = await sql`
      SELECT DATE(created_at) as date, COUNT(*) as signups
      FROM waitlist 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    // Generate mock locations based on IP patterns (in production, you'd use a real geo IP service)
    const locations = ['San Francisco', 'London', 'Berlin', 'Toronto', 'New York', 'Tokyo', 'Sydney', 'Amsterdam'];
    const recentSignups = recentResult.map((signup, index) => {
      const emailParts = signup.email.split('@')[0];
      const initials = emailParts.charAt(0).toUpperCase() + emailParts.split('.')[1]?.charAt(0).toUpperCase() || emailParts.charAt(1).toUpperCase();
      const location = locations[index % locations.length];
      
      return {
        email: signup.email,
        initials: initials,
        location: location,
        device: signup.device_type,
        time: signup.created_at
      };
    });

    return NextResponse.json({ 
      totalCount,
      recentSignups,
      dailyStats,
      goal: 1000 // Strategic target
    });
  } catch (error) {
    console.error('Waitlist stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
