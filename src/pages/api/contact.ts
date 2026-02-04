/* eslint-disable no-undef */
import { Resend } from 'resend';
import type { APIRoute } from 'astro';

// Initialize Resend client
const resend = new Resend(import.meta.env.RESEND_API_KEY);

// Type definitions
interface ContactRequest {
  name: string;
  email: string;
  message: string;
  lang: 'fr' | 'en';
}

interface ValidationMessages {
  name_required: string;
  name_min: string;
  email_required: string;
  email_invalid: string;
  message_required: string;
  message_min: string;
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
    name_required: 'Veuillez entrer votre nom.',
    name_min: 'Le nom doit contenir au moins 2 caractères.',
    email_required: "L'adresse email est requise.",
    email_invalid: 'Veuillez entrer une adresse email valide.',
    message_required: 'Veuillez entrer un message.',
    message_min: 'Le message doit contenir au moins 10 caractères.',
    validation_error: 'Veuillez corriger les erreurs ci-dessous.',
    server_error: 'Une erreur est survenue. Veuillez réessayer.',
    success: 'Message envoyé ! Nous vous répondrons dans les 24 heures.',
  },
  en: {
    name_required: 'Please enter your name.',
    name_min: 'Name must be at least 2 characters.',
    email_required: 'Please enter your email.',
    email_invalid: 'Please enter a valid email address.',
    message_required: 'Please enter a message.',
    message_min: 'Message must be at least 10 characters.',
    validation_error: 'Please fix the errors below.',
    server_error: 'Something went wrong. Please try again.',
    success: "Message sent! We'll respond within 24 hours.",
  },
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateContact(
  data: ContactRequest,
  lang: 'fr' | 'en'
): Record<string, string> {
  const errors: Record<string, string> = {};
  const m = messages[lang];

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = m.name_required;
  } else if (data.name.trim().length < 2 || data.name.trim().length > 100) {
    errors.name = m.name_min;
  }

  // Email validation
  if (!data.email) {
    errors.email = m.email_required;
  } else if (!isValidEmail(data.email) || data.email.length > 255) {
    errors.email = m.email_invalid;
  }

  // Message validation
  if (!data.message || data.message.trim().length === 0) {
    errors.message = m.message_required;
  } else if (data.message.trim().length < 10 || data.message.trim().length > 2000) {
    errors.message = m.message_min;
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

async function sendAdminNotification(data: ContactRequest): Promise<void> {
  const adminEmail = import.meta.env.ADMIN_EMAIL;

  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL not configured');
  }

  // Sanitize user input for email
  const safeName = escapeHtml(data.name.trim());
  const safeEmail = escapeHtml(data.email.trim());
  const safeMessage = escapeHtml(data.message.trim());

  const timestamp = new Date().toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
  });

  await resend.emails.send({
    from: 'n∞sia Contact <onboarding@resend.dev>',
    to: adminEmail,
    subject: `New Contact: ${safeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">New Contact Form Submission</h1>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin: 0 0 10px;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          <p style="margin: 0 0 10px;"><strong>Message:</strong></p>
          <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
        </div>
        <p style="color: #666; font-size: 14px;"><strong>Language:</strong> ${data.lang}</p>
        <p style="color: #666; font-size: 14px;"><strong>Submitted:</strong> ${timestamp}</p>
      </div>
    `,
    text: `
New Contact Form Submission

Name: ${safeName}
Email: ${safeEmail}
Message:
${safeMessage}

Language: ${data.lang}
Submitted: ${timestamp}
    `.trim(),
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Validate Content-Type header
    const contentType = request.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Content-Type must be application/json',
          fields: {},
        },
      } satisfies ErrorResponse), {
        status: 415,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = (await request.json()) as ContactRequest;
    const lang = body.lang === 'en' ? 'en' : 'fr';
    const m = messages[lang];

    // Validate input
    const errors = validateContact(body, lang);
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
    await sendAdminNotification({ ...body, lang });

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
    // Log error server-side
    console.error('Contact form error:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Attempt to detect language from Accept-Language header
    const acceptLang = request.headers.get('Accept-Language') || '';
    const errorLang = acceptLang.startsWith('en') ? 'en' : 'fr';

    // Return generic error to client
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: messages[errorLang].server_error,
      },
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const prerender = false;
