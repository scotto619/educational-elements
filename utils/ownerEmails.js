const DEFAULT_OWNER_EMAILS = ['scotto6190@gmail.com'];

const collectEnvEmails = () => {
  const sources = [
    process.env.NEXT_PUBLIC_OWNER_EMAILS,
    process.env.NEXT_PUBLIC_OWNER_EMAIL,
    process.env.OWNER_EMAILS,
    process.env.OWNER_EMAIL
  ];

  return sources
    .filter(Boolean)
    .flatMap(value => value.split(','))
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
};

const OWNER_EMAILS = Array.from(new Set([...collectEnvEmails(), ...DEFAULT_OWNER_EMAILS])).sort();

export const isOwnerEmail = (email) => {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.trim().toLowerCase());
};

export { OWNER_EMAILS, DEFAULT_OWNER_EMAILS };
