import type { APIRoute } from 'astro';
import { disableDraftMode } from '@/features/draft-mode/cookie';

export const GET: APIRoute = ({ cookies, redirect, url }) => {
  disableDraftMode(cookies);
  const back = url.searchParams.get('redirect');
  return redirect(back?.startsWith('/') ? back : '/', 307);
};
