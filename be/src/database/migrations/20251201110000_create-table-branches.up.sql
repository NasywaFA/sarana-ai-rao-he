CREATE TABLE branches (
    id                  UUID            PRIMARY KEY,
    name                VARCHAR(255)    NOT NULL,
    slug                VARCHAR(100)    NOT NULL,
    pic_emails          TEXT DEFAULT '',
    pic_phone_numbers   TEXT DEFAULT '',
    created_by          VARCHAR(255),
    updated_by          VARCHAR(255),
    deleted_by          VARCHAR(255),
    deleted_at          TIMESTAMP,
    created_at          TIMESTAMP       DEFAULT NOW(),
    updated_at          TIMESTAMP       DEFAULT NOW()
);
