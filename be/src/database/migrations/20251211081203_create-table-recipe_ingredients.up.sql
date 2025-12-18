CREATE TABLE recipe_ingredients (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id   UUID            NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    recipe_id   UUID            NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    item_id     UUID            NOT NULL REFERENCES items(id),
    quantity    DOUBLE PRECISION NOT NULL,
    unit        VARCHAR(50)     NOT NULL,
    created_at  TIMESTAMP       DEFAULT NOW(),
    updated_at  TIMESTAMP       DEFAULT NOW(),
    deleted_at  TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_branch_id ON recipe_ingredients(branch_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_item_id ON recipe_ingredients(item_id);