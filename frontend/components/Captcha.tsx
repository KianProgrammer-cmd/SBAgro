'use client';

import { Turnstile } from '@marsidev/react-turnstile';

type Props = {
  onSuccess: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
};

export default function Captcha({
  onSuccess,
  onExpire,
  onError,
}: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
        کلید کپچا تنظیم نشده است.
      </div>
    );
  }

  return (
    <div className="flex justify-center py-2">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onExpire={onExpire}
        onError={onError}
        options={{
          theme: 'dark',
          language: 'fa',
        }}
      />
    </div>
  );
}
