DROP TABLE IF EXISTS inquiries;

CREATE TABLE inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inquiry_id TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    dev_type TEXT NOT NULL,
    min_price INTEGER NOT NULL,
    max_price INTEGER NOT NULL,
    description TEXT,
    breakdown TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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
);
