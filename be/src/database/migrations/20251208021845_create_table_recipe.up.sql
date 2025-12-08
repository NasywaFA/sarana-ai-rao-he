CREATE TABLE recipes (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID            NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT            NOT NULL,
    ingredients     TEXT            NOT NULL,
    instruction     TEXT            NOT NULL,
    created_by      UUID            NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP       DEFAULT NOW(),
    updated_at      TIMESTAMP       DEFAULT NOW(),
    deleted_at      TIMESTAMP
);