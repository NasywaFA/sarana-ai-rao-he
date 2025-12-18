CREATE TABLE recipes (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID            NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    code            VARCHAR(50)     UNIQUE NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    type            VARCHAR(50)     NOT NULL,
    description     TEXT,
    instruction     TEXT,
    created_by      VARCHAR(100),
    created_at      TIMESTAMP       DEFAULT NOW(),
    updated_at      TIMESTAMP       DEFAULT NOW(),
    deleted_at      TIMESTAMP,
    CONSTRAINT idx_recipes_code_branch UNIQUE (code, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_recipes_branch_id ON recipes(branch_id);
CREATE INDEX IF NOT EXISTS idx_recipes_type ON recipes(type);