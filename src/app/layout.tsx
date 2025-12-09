import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SOPify - Automated SOP Generator',
  description: 'Transform operational incidents into structured, actionable SOPs instantly',
  keywords: ['SOP', 'Standard Operating Procedure', 'Incident Management', 'Operations', 'Automation'],
  authors: [{ name: 'SOPify Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans antialiased">
        <div className="min-h-full">
          {children}
        </div>
      </body>
    </html>
  );
}

