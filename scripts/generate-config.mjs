import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();

const outputPath = path.join(rootDir, 'js', 'runtime-config.js');

const parseEnv = (raw) => {
  const result = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
};

const requiredKeys = [
  'PUBLIC_SITE_URL',
  'PUBLIC_CONTACT_FORM_ENDPOINT',
  'PUBLIC_EMAIL',
  'PUBLIC_WHATSAPP_URL',
  'PUBLIC_LINKEDIN_URL',
  'PUBLIC_GITHUB_URL',
  'PUBLIC_INSTAGRAM_URL',
  'PUBLIC_PROJECTS_WHATSAPP_URL'
];

// Start with variables provided by Vercel/local environment
const env = {};

for (const key of requiredKeys) {
  if (process.env[key]) {
    env[key] = process.env[key];
  }
}

// If running locally and .env exists, use values from .env
try {
  const envPath = path.join(rootDir, '.env');
  const rawEnv = await readFile(envPath, 'utf8');
  const fileEnv = parseEnv(rawEnv);

  for (const key of requiredKeys) {
    if (!env[key] && fileEnv[key]) {
      env[key] = fileEnv[key];
    }
  }
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }

  console.log('.env not found. Using environment variables.');
}

const missingKeys = requiredKeys.filter((key) => !env[key]);

if (missingKeys.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingKeys.join(', ')}`
  );
}

const config = {
  siteUrl: env.PUBLIC_SITE_URL.replace(/\/+$/, ''),
  contactFormEndpoint: env.PUBLIC_CONTACT_FORM_ENDPOINT,
  email: env.PUBLIC_EMAIL,
  emailUrl: `mailto:${env.PUBLIC_EMAIL}`,
  whatsappUrl: env.PUBLIC_WHATSAPP_URL,
  linkedinUrl: env.PUBLIC_LINKEDIN_URL,
  githubUrl: env.PUBLIC_GITHUB_URL,
  instagramUrl: env.PUBLIC_INSTAGRAM_URL,
  projectsWhatsappUrl: env.PUBLIC_PROJECTS_WHATSAPP_URL
};

const fileContents =
  `window.__SITE_CONFIG__ = ${JSON.stringify(config, null, 2)};\n`;

await mkdir(path.dirname(outputPath), { recursive: true });

await writeFile(outputPath, fileContents, 'utf8');

console.log(`Generated ${path.relative(rootDir, outputPath)}`);