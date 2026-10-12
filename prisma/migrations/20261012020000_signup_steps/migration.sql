-- Sign-up steps 1 to 5 (RF-16): knowledge level, several interests, motivation.
ALTER TYPE "Knowledge" ADD VALUE 'PROFICIENT';

ALTER TABLE "Profile" ADD COLUMN "knowledgeLevel" "Knowledge";
ALTER TABLE "Profile" ADD COLUMN "motivation" TEXT;

-- Keep each existing interest as a one-item list.
ALTER TABLE "Profile"
  ALTER COLUMN "interests" TYPE "Interest"[] USING ARRAY["interests"];

-- RF-16 does not ask for a destination, so it becomes optional.
ALTER TABLE "Profile" ALTER COLUMN "destination" DROP NOT NULL;
