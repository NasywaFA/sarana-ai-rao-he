INSERT INTO branches (
    id,
    name,
    slug,
    pic_emails,
    pic_phone_numbers,
    created_by,
    updated_by,
    deleted_by,
    deleted_at,
    created_at,
    updated_at
) VALUES
(
    'gen_random_uuid()',
    'Rao He Malang',
    'rao-he-malang',
    'raohemalang@sarana.ai',
    '084234567890',
    'admin',
    NULL,
    NULL,
    NULL,
    'now()',
    'now()'
),
(
    'gen_random_uuid()',
    'Rao He Jakarta',
    'rao-he-jakarta',
    'raohejakarta@sarana.ai',
    '081234567890',
    'admin',
    NULL,
    NULL,
    NULL,
    'now()',
    'now()'
);
