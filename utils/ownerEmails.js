const DEFAULT_OWNER_EMAILS = ['scotto6190@gmail.com'];

const parseEmailList = (value) =>
  (value || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const OWNER_EMAILS = Array.from(new Set([
  ...parseEmailList(process.env.NEXT_PUBLIC_OWNER_EMAILS),
  ...parseEmailList(process.env.NEXT_PUBLIC_OWNER_EMAIL),
  ...parseEmailList(process.env.OWNER_EMAILS),
  ...parseEmailList(process.env.OWNER_EMAIL),
  ...DEFAULT_OWNER_EMAILS,
]));

export { DEFAULT_OWNER_EMAILS, OWNER_EMAILS };
