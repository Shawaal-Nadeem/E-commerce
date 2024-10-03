'use client';

import { Button } from '@/common/button';
import { Chip, ChipClose, ChipContent } from '@/common/chip';
import { MobilePadding } from '@/common/mobile-padding';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useSelectedOptionsContext } from './selected-options-context';

const orderComparer = Intl.Collator(undefined, { numeric: true });

export function SelectedFilters() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { optimisticSelectedOptions, setOptimisticSelectedOptions } =
    useSelectedOptionsContext();

  // Filter out options that are not visible or have no value
  const visibleOptions = optimisticSelectedOptions
    .filter((option) => option.isVisible && option.value) // Ensure value is not empty
    .toSorted((a, b) => orderComparer.compare(a.order, b.order));

  return (
    <div data-pending={isPending ? true : undefined}>
      {/* Only render if there are valid filters selected */}
      {visibleOptions.length > 0 && (
        <MobilePadding>
          <ul className="flex flex-row flex-wrap items-center gap-1">
            {visibleOptions.map((selectedOption) => {
              return (
                <li key={`${selectedOption.filterKey}_${selectedOption.value}`}>
                  <Chip>
                    <ChipContent>{selectedOption.title}</ChipContent>
                    <ChipClose
                      aria-label={`Remove ${selectedOption.title} filter`}
                      onClick={() => {
                        const newOptimisticSelectedOptions =
                          optimisticSelectedOptions.filter(
                            (option) =>
                              option.filterKey !== selectedOption.filterKey ||
                              option.value !== selectedOption.value,
                          );

                        startTransition(() => {
                          setOptimisticSelectedOptions(
                            newOptimisticSelectedOptions,
                          );

                          const params = new URLSearchParams();

                          // Add valid selected options to query params
                          for (const selectedOption of newOptimisticSelectedOptions) {
                            if (selectedOption.isVisible && selectedOption.value) {
                              params.append(
                                selectedOption.filterKey,
                                selectedOption.value,
                              );
                            }
                          }

                          router.push(`/search?${params.toString()}`);
                        });
                      }}
                    />
                  </Chip>
                </li>
              );
            })}
            <li>
              <Button
                className="text-sm"
                onClick={() => {
                  startTransition(() => {
                    setOptimisticSelectedOptions([]);
                    router.push('/search');
                  });
                }}
              >
                Clear Filters
              </Button>
            </li>
          </ul>
        </MobilePadding>
      )}
    </div>
  );
}
