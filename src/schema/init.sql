create table if not exists user_behaviors (
  "code" text,
  "formid" text,
  "grp" text,
  "ltpa" text,
  "orgid" text,
  "ssoid" text,
  "subtype" text,
  "sudirresponse" text,
  "ts" integer, -- unix
  "type" text,
  "url" text,
  "ymdh" timestamp -- converted from YYYY-MM-DD-HH
)