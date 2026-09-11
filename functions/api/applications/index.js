// functions/api/applications/index.js
// Resilient Candidate Retrieval with Auto-Migration & Seed Fallback

const SEED_APPLICATIONS = [
  {
    "applicationId": "APP-314367",
    "appliedAt": "2026-09-09T08:32:33.879Z",
    "status": "New",
    "position": "General Application",
    "isInternship": false,
    "name": "ARSHAD SHAIKH",
    "email": "abfdfx@gmail.com",
    "phone": "+919112936487",
    "city": "AHMADNAGAR",
    "linkedin": "",
    "portfolio": "",
    "experience": "Fresher",
    "resume": "https://drive.com",
    "cover": "",
    "whyTaskas": "nothing",
    "academic": null,
    "hrNotes": []
  },
  {
    "applicationId": "APP-917017",
    "appliedAt": "2026-09-09T08:28:46.893Z",
    "status": "New",
    "position": "Graphic Designer",
    "isInternship": false,
    "name": "ARSHAD SHAFIK SHAIKH",
    "email": "shaikharshad92316@gmail.com",
    "phone": "+919112936409",
    "city": "AHMADNAGAR",
    "linkedin": "",
    "portfolio": "",
    "experience": "Fresher",
    "resume": "https://drive.com",
    "cover": "",
    "whyTaskas": "nothing",
    "academic": null,
    "hrNotes": []
  },
  {
    "applicationId": "APP-2026-10492",
    "appliedAt": "2026-09-09T10:15:00Z",
    "status": "New",
    "position": "Graphic Designer",
    "isInternship": false,
    "name": "Rahul Sharma",
    "email": "rahul.sharma@example.com",
    "phone": "+91 98231 44510",
    "city": "Pune, Maharashtra",
    "linkedin": "https://linkedin.com/in/rahul-sharma-design",
    "portfolio": "https://behance.net/rahulsharma_creative",
    "experience": "Fresher",
    "resume": "https://drive.google.com/file/d/sample-resume-rahul/view",
    "cover": "I am a visual designer passionate about typography and brand systems. I love creating bold digital creatives and social carousels.",
    "whyTaskas": "TASKAS is building future-ready digital solutions with high aesthetic standards. I want to contribute to brand visuals and scale with the team.",
    "academic": null,
    "hrNotes": [
      {
        "date": "2026-09-09T11:00:00Z",
        "author": "HR",
        "text": "Strong portfolio on Behance. Color grading and typography are clean."
      }
    ]
  },
  {
    "applicationId": "APP-2026-10488",
    "appliedAt": "2026-09-08T14:30:00Z",
    "status": "Reviewing",
    "position": "Digital Marketing Executive",
    "isInternship": false,
    "name": "Priya Patil",
    "email": "priya.patil@example.com",
    "phone": "+91 87654 32190",
    "city": "Pune, Maharashtra",
    "linkedin": "https://linkedin.com/in/priyapatil-marketing",
    "portfolio": "https://priyapatil.me",
    "experience": "0\u20131 Years",
    "resume": "https://drive.google.com/file/d/sample-resume-priya/view",
    "cover": "Specialized in organic SEO, Instagram brand growth, and conversion funnels for tech services.",
    "whyTaskas": "The multidisciplinary culture at TASKAS allows marketers to work directly with technical architects and creators.",
    "academic": null,
    "hrNotes": [
      {
        "date": "2026-09-08T16:00:00Z",
        "author": "HR",
        "text": "Reviewing case studies for SEO growth."
      }
    ]
  },
  {
    "applicationId": "APP-2026-10461",
    "appliedAt": "2026-09-07T09:45:00Z",
    "status": "Interview",
    "position": "Business Development Executive",
    "isInternship": false,
    "name": "Aman Khan",
    "email": "aman.khan@example.com",
    "phone": "+91 91234 56780",
    "city": "Pune, Maharashtra",
    "linkedin": "https://linkedin.com/in/amankhan-bizdev",
    "portfolio": "",
    "experience": "Fresher",
    "resume": "https://drive.google.com/file/d/sample-resume-aman/view",
    "cover": "Proactive in outbound lead qualification, research, and client relationship management.",
    "whyTaskas": "Excited about modern digital products and eager to connect founders with TASKAS's cutting-edge web & AI services.",
    "academic": null,
    "hrNotes": [
      {
        "date": "2026-09-07T12:00:00Z",
        "author": "HR",
        "text": "Initial screening call went well. Scheduled technical interview for Thursday."
      }
    ]
  }
];

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }
  });
}

export async function onRequestGet(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const { env } = context;
    let list = [];

    if (env && env.DB) {
      try {
        // 1. Auto-create table if not exists (Zero-config migration)
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS applications (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            city TEXT,
            position TEXT NOT NULL,
            experience TEXT,
            is_internship INTEGER DEFAULT 0,
            status TEXT DEFAULT 'New',
            data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `).run();

        // 2. Fetch existing rows
        const { results } = await env.DB.prepare(
          'SELECT * FROM applications ORDER BY created_at DESC'
        ).all();

        if (results && Array.isArray(results) && results.length > 0) {
          list = results.map(row => {
            let parsedData = {};
            try {
              parsedData = JSON.parse(row.data || '{}');
            } catch (e) {
              parsedData = {};
            }
            return {
              applicationId: row.id,
              name: row.name || parsedData.name,
              email: row.email || parsedData.email,
              phone: row.phone || parsedData.phone,
              city: row.city || parsedData.city,
              position: row.position || parsedData.position,
              experience: row.experience || parsedData.experience,
              status: row.status || parsedData.status || 'New',
              isInternship: !!row.is_internship,
              appliedAt: row.created_at,
              updatedAt: row.updated_at,
              ...parsedData
            };
          });
        } else {
          // D1 table is currently empty - auto-seed default applications
          try {
            for (const app of SEED_APPLICATIONS) {
              await env.DB.prepare(`
                INSERT INTO applications (id, name, email, phone, city, position, experience, is_internship, status, data, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO NOTHING
              `).bind(
                app.applicationId,
                app.name || '',
                app.email || '',
                app.phone || '',
                app.city || '',
                app.position || '',
                app.experience || '',
                app.isInternship ? 1 : 0,
                app.status || 'New',
                JSON.stringify(app),
                app.appliedAt || new Date().toISOString(),
                new Date().toISOString()
              ).run();
            }
          } catch (seedErr) {
            console.warn('Auto-seed warning:', seedErr);
          }
          list = SEED_APPLICATIONS;
        }
      } catch (dbErr) {
        console.warn('D1 applications query warning:', dbErr);
        list = SEED_APPLICATIONS;
      }
    } else {
      // D1 binding not yet attached in Cloudflare dashboard, return seed list
      list = SEED_APPLICATIONS;
    }

    return new Response(JSON.stringify(list), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify(SEED_APPLICATIONS), {
      status: 200,
      headers: corsHeaders
    });
  }
}
