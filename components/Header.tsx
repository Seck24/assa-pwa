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
        background: 'rgba(13, 20, 32, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 230, 118, 0.15)',
        boxShadow: '0 1px 20px rgba(0,0,0,0.3)',
      }}
    >
      <button
        onClick={handleBack}
        className={`text-assa-green text-2xl font-bold w-8 ${!showBack ? 'invisible' : ''}`}
      >
        ←
      </button>
      <h1 className="text-white font-bold text-lg tracking-wider uppercase flex-1 text-center">
        {title}
      </h1>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: 'rgba(0, 230, 118, 0.12)',
          border: '1px solid rgba(0, 230, 118, 0.3)',
        }}
      >
        <span className="text-assa-green font-bold text-xs leading-none">ASSA</span>
      </div>
    </header>
  );
}
