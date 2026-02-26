'use client';

import React from 'react';
import Dashboard from '@/src/pages/Dashboard';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <Dashboard />
      <Footer />
    </>
  );
}
