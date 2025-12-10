CREATE TABLE items (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id   UUID            NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    code        VARCHAR(50)     NOT NULL,
    name        VARCHAR(255)    NOT NULL,
    type        VARCHAR(50)     NOT NULL,
    unit        VARCHAR(20)     NOT NULL,
    stock       DOUBLE PRECISION NOT NULL DEFAULT 0,
    lead_time   INT             NOT NULL,
    created_at  TIMESTAMP       DEFAULT NOW(),
    updated_at  TIMESTAMP       DEFAULT NOW(),
    deleted_at  TIMESTAMP,
    CONSTRAINT idx_code_branch UNIQUE (code, branch_id)
);