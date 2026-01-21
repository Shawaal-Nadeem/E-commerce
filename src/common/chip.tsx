import type { ButtonProps } from './button';
import { Button } from './button';
import { CloseIcon } from './icons';

type ChipProps = React.PropsWithChildren;

export function Chip({ children }: ChipProps) {
  return (
    <div className="flex select-none items-center gap-1 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-stone-900/40 border border-yellow-200 dark:border-yellow-800/50 px-3 py-1 text-xs font-bold text-yellow-800 dark:text-yellow-200 uppercase tracking-wider shadow-sm">
      {children}
    </div>
  );
}

type ChipCloseProps = ButtonProps;

export function ChipClose(props: ChipCloseProps) {
  return (
    <Button
      {...props}
      className="h-6 w-6"
      variant="transparent"
      circle
      icon={<CloseIcon size="1.2rem" />}
    />
  );
}

type ChipContentProps = React.PropsWithChildren;

export function ChipContent({ children }: ChipContentProps) {
  return <span className="flex-1">{children}</span>;
}
