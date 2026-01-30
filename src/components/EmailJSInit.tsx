'use client';

import { useEffect } from 'react';
import emailjs from '@emailjs/browser';

export default function EmailJSInit() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ORDER_EMAILJS_PUBLIC_KEY) {
      emailjs.init(process.env.NEXT_PUBLIC_ORDER_EMAILJS_PUBLIC_KEY);
      console.log("✅ Order EmailJS Initialized");
    }
  }, []);

  return null; // This component doesn't render anything
}