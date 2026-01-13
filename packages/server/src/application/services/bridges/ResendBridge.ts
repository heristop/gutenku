import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('resend-bridge');

const RESEND_API_URL = 'https://api.resend.com/emails';

function getFromEmail(): string {
  return process.env.EMAIL_FROM || 'onboarding@resend.dev';
}

function getAppUrl(): string {
  return process.env.APP_URL || 'https://gutenku.xyz';
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    log.warn('Resend API key not configured, skipping email');
    return false;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    const data = (await response.json()) as { id?: string };

    if (!response.ok) {
      log.error({ error: data, to: options.to }, 'Failed to send email via Resend');
      return false;
    }

    log.info({ to: options.to, id: data.id }, 'Email sent successfully');
    return true;
  } catch (error) {
    log.error({ err: error, to: options.to }, 'Resend API error');
    return false;
  }
}

export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
): Promise<boolean> {
  const appUrl = getAppUrl();
  const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;

  return sendEmail({
    to: email,
    subject: 'Confirm your GutenGuess subscription',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #faf8f5;">
        <div style="background: white; padding: 32px; border-radius: 8px; border: 1px solid #e8e4df;">
          <h2 style="color: #2a5934; margin-top: 0;">Welcome to GutenGuess!</h2>
          <p style="color: #333; line-height: 1.6;">Thank you for subscribing to daily puzzle notifications.</p>
          <p style="color: #333; line-height: 1.6;">Please confirm your email address by clicking the button below:</p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}"
               style="background: #2a5934; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-weight: 500;">
              Confirm Subscription
            </a>
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e8e4df; margin: 24px 0;">
          <p style="color: #999; font-size: 12px; margin-bottom: 0;">
            GutenKu - Daily Literary Puzzles<br>
            <a href="${appUrl}" style="color: #2a5934;">gutenku.xyz</a>
          </p>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to GutenGuess!\n\nThank you for subscribing to daily puzzle notifications.\n\nConfirm your subscription: ${verifyUrl}\n\nThis link will expire in 24 hours.`,
  });
}

export async function sendDailyNotification(
  email: string,
  puzzleNumber: number,
  unsubscribeToken: string,
): Promise<boolean> {
  const appUrl = getAppUrl();
  const playUrl = `${appUrl}/game`;
  const unsubscribeUrl = `${appUrl}/unsubscribe?token=${unsubscribeToken}`;

  return sendEmail({
    to: email,
    subject: `GutenGuess #${puzzleNumber} is ready!`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #faf8f5;">
        <div style="background: white; padding: 32px; border-radius: 8px; border: 1px solid #e8e4df;">
          <h2 style="color: #2a5934; margin-top: 0;">Today's Puzzle is Ready!</h2>
          <p style="color: #333; line-height: 1.6;">A new book awaits your literary detective skills.</p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${playUrl}"
               style="background: #2a5934; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-weight: 500;">
              Play GutenGuess #${puzzleNumber}
            </a>
          </p>
          <p style="color: #666; line-height: 1.5;">Can you guess the classic book from the clues?</p>
          <hr style="border: none; border-top: 1px solid #e8e4df; margin: 24px 0;">
          <p style="color: #999; font-size: 12px; margin-bottom: 0;">
            <a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a> from daily notifications
          </p>
        </div>
      </body>
      </html>
    `,
    text: `GutenGuess #${puzzleNumber} is ready!\n\nA new book awaits your literary detective skills.\n\nPlay now: ${playUrl}\n\n---\nUnsubscribe: ${unsubscribeUrl}`,
  });
}
