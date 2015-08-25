CREATE TABLE WebSession (
    sid VARCHAR(255) PRIMARY KEY,
    expires DATETIME NULL,
    data TEXT,
    createdAt DATETIME NULL,
    updatedAt DATETIME NULL
);