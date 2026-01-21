import { CheckIcon } from '@/common/icons';
import { twJoin } from 'tailwind-merge';

export function getSelectableItemProps() {
  return {
    rootClassName: 'flex items-center gap-1',
    itemClassName: twJoin(
      'h-6 w-6 flex-none rounded-md border-2 border-yellow-500 dark:border-yellow-400',
      'data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-yellow-500 data-[state=checked]:to-yellow-600',
      'disabled:opacity-50 [&+label]:disabled:opacity-50',
      '[&+label]:enabled:cursor-pointer [&+label]:enabled:hover:bg-yellow-50 dark:[&+label]:enabled:hover:bg-yellow-950/30 [&+label]:enabled:active:bg-yellow-100 dark:[&+label]:enabled:active:bg-yellow-900/50',
    ),
    indicatorClassName:
      'flex items-center justify-center text-stone-950',
    icon: <CheckIcon className="mt-0.5" size="1.2rem" strokeWidth={3} />,
    labelClassName:
      'w-full select-none rounded-md p-2 text-sm font-bold text-stone-700 dark:text-stone-300',
  };
}
