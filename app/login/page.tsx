'use client';

import React from 'react';
import Login from '@/src/pages/Login';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <Login />
      <Footer />
    </>
  );
}
