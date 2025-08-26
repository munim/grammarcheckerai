
interface TurnstileResponse {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
}

export async function verifyTurnstile(token: string): Promise<boolean> {
  // Check if Turnstile is enabled (check both TURNSTILE_ENABLED and NEXT_PUBLIC_TURNSTILE_ENABLED for backward compatibility)
  const isTurnstileEnabled = process.env.TURNSTILE_ENABLED !== 'false' && process.env.NEXT_PUBLIC_TURNSTILE_ENABLED !== 'false';
  
  if (!isTurnstileEnabled) {
    return true;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY is not set');
    return false;
  }

  const verificationUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  
  try {
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    if (!response.ok) {
      console.error(`Turnstile verification request failed with status: ${response.status}`);
      return false;
    }

    const data: TurnstileResponse = await response.json();
    return data.success;
  } catch (error) {
    console.error('An error occurred during Turnstile verification:', error);
    return false;
  }
}
