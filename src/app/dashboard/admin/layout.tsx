// This file can be removed if not used to create a specific layout for the admin section.
// For now, it will just pass children through.
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
