'use client';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
}

export default function Header({ title, showBack = true, backHref }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) router.push(backHref);
    else router.back();
  };

  return (
    <header
      className="flex items-center justify-between px-4 py-3 sticky top-0 z-40"
      style={{
        background: 'rgba(13, 20, 16, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 230, 118, 0.08)',
        boxShadow: '0 1px 24px rgba(0,0,0,0.35)',
      }}
    >
      <button
        onClick={handleBack}
        className={`text-2xl font-bold w-8 transition-opacity ${!showBack ? 'invisible' : ''}`}
        style={{ color: '#00e676' }}
      >
        ←
      </button>
      <h1
        className="font-display font-bold text-base tracking-widest uppercase flex-1 text-center"
        style={{ color: '#d8e8d8' }}
      >
        {title}
      </h1>
      <div
        className="w-10 h-10 flex items-center justify-center flex-shrink-0"
        style={{
          borderRadius: 12,
          background: 'rgba(0, 230, 118, 0.10)',
          border: '1px solid rgba(0, 230, 118, 0.16)',
        }}
      >
        <span className="font-display font-bold text-xs leading-none" style={{ color: '#00e676' }}>ASSA</span>
      </div>
    </header>
  );
}
