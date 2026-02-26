'use client';

import React from 'react';
import Home from '@/src/pages/Home';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';

export default function Page() {
  return (
    <>
      <Navbar />
      <Home />
      <Footer />
    </>
  );
}
