CREATE TABLE item_transactions (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID            NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    item_id         UUID            NOT NULL REFERENCES items(id),
    type            VARCHAR(10)     NOT NULL, -- 'in' or 'out'
    amount          DOUBLE PRECISION NOT NULL,
    current_stock   DOUBLE PRECISION NOT NULL,
    note            TEXT,
    transaction_date TIMESTAMP       NOT NULL,
    created_at      TIMESTAMP       DEFAULT NOW(),
    updated_at      TIMESTAMP       DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

CREATE INDEX idx_item_transactions_item_id ON item_transactions(item_id);
CREATE INDEX idx_item_transactions_branch_id ON item_transactions(branch_id);
