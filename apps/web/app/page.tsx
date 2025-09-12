import { redirect } from 'next/navigation';

// Redirect root to landing page
export default function HomePage() {
  redirect('/landing');
}