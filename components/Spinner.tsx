export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return (
    <div className={`${s} border-2 border-assa-green border-t-transparent rounded-full animate-spin`} />
  );
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 bg-assa-bg flex items-center justify-center z-50">
      <Spinner size="lg" />
    </div>
  );
}
