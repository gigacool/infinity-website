/* eslint-disable no-undef */
import { Resend } from 'resend';

import type { APIRoute } from 'astro';

// Initialize Resend client
const resend = new Resend(import.meta.env.RESEND_API_KEY);

// Type definitions
interface BetaSignupRequest {
  email: string;
  name: string;
  skills: string[];
  role?: string;
  company?: string;
  lang: 'fr' | 'en';
}

interface ValidationMessages {
  email_required: string;
  email_invalid: string;
  name_required: string;
  skills_min: string;
  skills_max: string;
  validation_error: string;
  server_error: string;
  success: string;
}

interface ValidationError {
  code: 'VALIDATION_ERROR';
  message: string;
  fields: Record<string, string>;
}

interface ServerError {
  code: 'SERVER_ERROR';
  message: string;
}

type APIError = ValidationError | ServerError;

interface SuccessResponse {
  success: true;
  message: string;
}

interface ErrorResponse {
  success: false;
  error: APIError;
}

// i18n messages for API responses
const messages: Record<'fr' | 'en', ValidationMessages> = {
  fr: {
    email_required: "L'adresse email est requise",
    email_invalid: 'Veuillez entrer une adresse email valide',
    name_required: 'Le prénom est requis',
    skills_min: 'Sélectionnez au moins 1 compétence',
    skills_max: 'Vous pouvez sélectionner 5 compétences maximum',
    validation_error: 'Veuillez corriger les erreurs ci-dessous',
    server_error: 'Une erreur est survenue. Veuillez réessayer.',
    success: 'Inscription réussie ! Vous recevrez un email de confirmation.',
  },
  en: {
    email_required: 'Email address is required',
    email_invalid: 'Please enter a valid email address',
    name_required: 'First name is required',
    skills_min: 'Select at least 1 skill',
    skills_max: 'You can select up to 5 skills',
    validation_error: 'Please fix the errors below',
    server_error: 'An error occurred. Please try again.',
    success: "Signup successful! You'll receive a confirmation email.",
  },
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateSignup(
  data: BetaSignupRequest,
  lang: 'fr' | 'en'
): Record<string, string> {
  const errors: Record<string, string> = {};
  const m = messages[lang];

  // Email validation
  if (!data.email) {
    errors.email = m.email_required;
  } else if (!isValidEmail(data.email)) {
    errors.email = m.email_invalid;
  }

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = m.name_required;
  }

  // Skills validation
  if (!data.skills || data.skills.length === 0) {
    errors.skills = m.skills_min;
  } else if (data.skills.length > 5) {
    errors.skills = m.skills_max;
  }

  return errors;
}

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

async function sendAdminNotification(data: BetaSignupRequest): Promise<void> {
  const adminEmail = import.meta.env.ADMIN_EMAIL;

  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL not configured');
  }

  // Sanitize user input for email
  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safeSkills = data.skills.map((s) => escapeHtml(s));
  const safeRole = data.role ? escapeHtml(data.role) : null;
  const safeCompany = data.company ? escapeHtml(data.company) : null;

  const skillsList = safeSkills.map((s) => `• ${s}`).join('\n');
  const timestamp = new Date().toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
  });

  await resend.emails.send({
    from: 'Infinity Beta <onboarding@resend.dev>',
    to: adminEmail,
    subject: `🎉 New Beta Signup: ${safeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">New Beta Signup!</h1>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin: 0 0 10px;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          <p style="margin: 0 0 10px;"><strong>Skills of Interest:</strong></p>
          <ul style="margin: 0; padding-left: 20px;">
            ${safeSkills.map((s) => `<li>${s}</li>`).join('')}
          </ul>
          ${safeRole ? `<p style="margin: 10px 0 0;"><strong>Role:</strong> ${safeRole}</p>` : ''}
          ${safeCompany ? `<p style="margin: 10px 0 0;"><strong>Company:</strong> ${safeCompany}</p>` : ''}
        </div>
        <p style="color: #666; font-size: 14px;">Signed up: ${timestamp}</p>
      </div>
    `,
    text: `
New Beta Signup!

Name: ${safeName}
Email: ${safeEmail}
Skills:
${skillsList}
${safeRole ? `Role: ${safeRole}` : ''}
${safeCompany ? `Company: ${safeCompany}` : ''}
Signed up: ${timestamp}
    `.trim(),
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as BetaSignupRequest;
    const lang = body.lang === 'en' ? 'en' : 'fr';
    const m = messages[lang];

    // Validate input
    const errors = validateSignup(body, lang);
    if (Object.keys(errors).length > 0) {
      const response: ErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: m.validation_error,
          fields: errors,
        },
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send admin notification email
    await sendAdminNotification(body);

    // Success response
    const response: SuccessResponse = {
      success: true,
      message: m.success,
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Log error server-side (without sensitive data)
    console.error('Beta signup error:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Return generic error to client
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: messages.fr.server_error,
      },
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const prerender = false;
