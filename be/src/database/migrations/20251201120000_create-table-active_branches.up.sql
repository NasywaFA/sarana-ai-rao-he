CREATE TABLE active_branches (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL,
    branch_id   UUID        NOT NULL,
    created_at  TIMESTAMP   DEFAULT NOW(),
    updated_at  TIMESTAMP   DEFAULT NOW(),
    CONSTRAINT fk_active_branch_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_active_branch_branch
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);
