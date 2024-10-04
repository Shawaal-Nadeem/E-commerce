'use client';

import { Paper, PaperTitle } from '@/common/paper';
import { Checkbox, CheckboxGroup } from '@/forms/checkbox-group';
import { RadioGroup, RadioGroupItem } from '@/forms/radio-group';
import type {
  ProductFilterData,
  ProductFilterResponse,
} from '@/search/search-types';
import {
  ProductFilterKey,
  ProductSorting,
  getValuesOfSelectedOptions,
} from '@/search/search-utils';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';
import { useSelectedOptionsContext } from './selected-options-context';
import { createClient } from 'contentful';
import { Entry } from 'contentful';
import { CheckboxGroupCategories } from '@/forms/checkbox-groupCat';
import { CheckboxCat } from '@/forms/checkbox-groupCat';
type ProductFilterProps = {
  data: ProductFilterResponse;
};

type FilterOptionsDataType = Entry<any>;

export function ProductFilter({ data }: ProductFilterProps) {
  const spaceId = process.env.NEXT_PUBLIC_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENT_DELIVERY_API;
  const [newData, setNewData] = useState<FilterOptionsDataType | undefined>();

  useEffect(() => {
    async function getNestedRichData(client: any, section: any) {
      if (section && section.fields?.options) {
        const options = await Promise.all(
          section.fields.options.map(async (item: any) => {
            const entry = await client.getEntry(item.sys.id);
            return entry;
          })
        );
        return options;
      }
    }

    const getData = async () => {
      const client = createClient({
        space: spaceId as string,
        accessToken: accessToken as string,
      });

      try {
        const filterOptionsData = await client.getEntries({
          content_type: 'filterOptions',
        });
        let fOptionsCategories = filterOptionsData.items[0]?.fields?.categories as Entry<any> | undefined;

        if (fOptionsCategories) {
          let result = await getNestedRichData(client, fOptionsCategories);
          (fOptionsCategories as any).fields.options = result;
        }

        let fOptionsPriceRange = filterOptionsData.items[0]?.fields?.priceRanges as Entry<any> | undefined;

        if (fOptionsPriceRange) {
          let result = await getNestedRichData(client, fOptionsPriceRange);
          (fOptionsPriceRange as any).fields.options = result;
        }

        let fOptionsSortings = filterOptionsData.items[0]?.fields?.sortings as Entry<any> | undefined;

        if (fOptionsSortings) {
          let result = await getNestedRichData(client, fOptionsSortings);
          (fOptionsSortings as any).fields.options = result;
        }
        
        setNewData(filterOptionsData.items[0]);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    getData();
  }, []);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { optimisticSelectedOptions, setOptimisticSelectedOptions } = useSelectedOptionsContext();

  const values = getValuesOfSelectedOptions(optimisticSelectedOptions);

  const handleChange = (filterKey: ProductFilterData['filterKey'], newValues: string[]) => {
    const newOptimisticSelectedOptions = [...optimisticSelectedOptions];
    const existingFilterIndex = newOptimisticSelectedOptions.findIndex(
      (option) => option.filterKey === filterKey
    );

    // Remove existing options for this filter key
    if (existingFilterIndex > -1) {
      newOptimisticSelectedOptions.splice(existingFilterIndex, 1);
    }

    const filterOption = Object.values(newData?.fields || {}).find(
      (item: any) => item?.fields?.filterKey === filterKey
    );

    if (!filterOption) {
      console.error('Filter option not found for key:', filterKey);
      return;
    }

    // Add selected values to the optimistic options
    for (const value of newValues) {
      const option = filterOption?.fields?.options?.find(
        (item: any) => item.fields.value.toLowerCase() === value?.toLowerCase()
      );

      if (option && option.fields.value) {
        newOptimisticSelectedOptions.push({
          ...option,
          filterKey,
          isVisible: (option.fields.value as ProductSorting) !== ProductSorting.DEFAULT,
        });
      }
    }

    // Update the state
    startTransition(() => {
      setOptimisticSelectedOptions(newOptimisticSelectedOptions);
      updateQueryParams(filterKey, newValues, newOptimisticSelectedOptions);
    });
  };

  const updateQueryParams = (
    filterKey: ProductFilterData['filterKey'],
    newValues: string[],
    updatedOptions: any[]
  ) => {
    const currentParams = new URLSearchParams(window.location.search);

    if (filterKey === ProductFilterKey.CATEGORIES) {
      // Remove previous category if it exists
      currentParams.delete(ProductFilterKey.CATEGORIES);
      // Append the new category value
      newValues.forEach((value) => {
        currentParams.set(ProductFilterKey.CATEGORIES, value); // Use set to overwrite the previous category
      });
    } else {
      // Remove existing values for the current filter key
      currentParams.delete(filterKey);
      // For other filters, append the new values
      newValues.forEach((value) => {
        currentParams.append(filterKey, value);
      });
    }

    // Append all other selected options except for categories (handled separately)
    updatedOptions.forEach((selectedOption) => {
      if (selectedOption.filterKey !== ProductFilterKey.CATEGORIES && selectedOption?.fields?.value) {
        if (!currentParams.has(selectedOption.filterKey) || !currentParams.getAll(selectedOption.filterKey).includes(selectedOption?.fields?.value)) {
          currentParams.append(
            selectedOption.filterKey,
            selectedOption?.fields?.value
          );
        }
      }
    });

    // Push the updated URL
    router.push(`/search?${currentParams.toString()}`);
  };

  return (
    <div data-pending={isPending ? true : undefined} className="flex flex-col gap-4 pb-6">
      {Object.values(newData?.fields || {}).map((item: any, index: number) => {
        let filterInput = null;
        const filterKey = item.fields?.filterKey as keyof typeof values;

        switch (filterKey) {
          case ProductFilterKey.CATEGORIES: {
            // CATEGORIES section removed from UI but still included in URL params
            filterInput = (
              <CheckboxGroupCategories
                value={values[filterKey]}
                onChange={(newValue) => {
                  handleChange(filterKey, newValue);
                }}
              >
                {item?.fields?.options?.map((option: any, index: number) => (
                  <CheckboxCat key={index} value={option?.fields?.value}>
                    {option?.fields?.title}
                  </CheckboxCat>
                ))}
              </CheckboxGroupCategories>
            );
            break;
          }
          case ProductFilterKey.PRICE_RANGES: {
            filterInput = (
              <CheckboxGroup
                value={values[filterKey]}
                onChange={(newValue) => {
                  handleChange(filterKey, newValue);
                }}
              >
                {item?.fields?.options?.map((option: any, index: number) => (
                  <Checkbox key={index} value={option?.fields?.value}>
                    {option?.fields?.title}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            );
            break;
          }
          case ProductFilterKey.SORTING: {
            filterInput = (
              <RadioGroup
                value={values[filterKey]}
                onChange={(newValue) => {
                  handleChange(filterKey, [newValue]);
                }}
              >
                {item?.fields?.options?.map((option: any, index: number) => (
                  <RadioGroupItem key={index} value={option?.fields?.value}>
                    {option?.fields?.title}
                  </RadioGroupItem>
                ))}
              </RadioGroup>
            );
          }
        }

        return (
          <div key={index}>
            <PaperTitle>{item.fields.title}</PaperTitle>
            <Paper>{filterInput}</Paper>
          </div>
        );
      })}
    </div>
  );
}
