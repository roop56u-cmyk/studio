import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to the user dashboard by default.
  // Login logic now handles routing to the admin dashboard.
  redirect('/dashboard/user');
}
