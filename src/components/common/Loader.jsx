export default function Loader({ size = 'md', text = 'Loading…' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div
        className={`${sizes[size]} border-primary border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-text-muted text-sm">{text}</p>}
    </div>
  );
}
