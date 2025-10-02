import { Suspense } from 'react';
import PageBuilder from '@/components/landing-builder/PageBuilder';
import { redirect } from 'next/navigation';

export default function CustomizePage({ params }: { params: { name: string } }) {
  const domainName = decodeURIComponent(params.name);

  const handleSave = async (data: any) => {
    'use server';
    // This will be called from client component
  };

  return (
    <div className="min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <PageBuilder
          domainId={domainName}
          domainName={domainName}
          onSave={async (data) => {
            await fetch('/api/landing-pages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
          }}
        />
      </Suspense>
    </div>
  );
}
