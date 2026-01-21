import { twMerge } from 'tailwind-merge';

type PaperProps = React.PropsWithChildren<{ className?: string }>;

export function Paper({ className, children }: PaperProps) {
  return (
    <div
      className={twMerge(
        'border border-yellow-200/50 dark:border-yellow-900/30 bg-white/80 dark:bg-stone-900/50 backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition-all duration-300 md:rounded-2xl md:p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

type PaperTitleProps = React.PropsWithChildren;

export function PaperTitle({ children }: PaperTitleProps) {
  return (
    <div className="mb-4 text-xl font-serif font-bold bg-gradient-to-r from-yellow-700 to-yellow-600 bg-clip-text text-transparent">
      {children}
    </div>
  );
}
