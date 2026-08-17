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
