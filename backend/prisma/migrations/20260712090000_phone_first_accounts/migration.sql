WITH missing_phones AS (
  SELECT
    id,
    row_number() OVER (ORDER BY "createdAt", id) AS rn
  FROM "User"
  WHERE phone IS NULL OR btrim(phone) = ''
)
UPDATE "User" AS u
SET phone = concat('099', lpad(missing_phones.rn::text, 7, '0'))
FROM missing_phones
WHERE u.id = missing_phones.id;

ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL;
