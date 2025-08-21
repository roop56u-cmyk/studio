import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to the user dashboard by default.
  // In a real app, you would have logic to determine if the user is an admin
  // and redirect them to /dashboard/admin instead.
  redirect('/dashboard/user');
}
