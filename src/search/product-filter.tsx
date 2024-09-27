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
    }
    getData();
  }, [])

  // console.log('ProductFilter');
  // console.log(data);
  // console.log(newData);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { optimisticSelectedOptions, setOptimisticSelectedOptions } =
    useSelectedOptionsContext();

  const values = getValuesOfSelectedOptions(optimisticSelectedOptions);

  const handleChange = (
    filterKey: ProductFilterData['filterKey'],
    newValues: string[],
  ) => {
    const newOptimisticSelectedOptions = optimisticSelectedOptions.filter(
      (option) => option.filterKey !== filterKey,
    );

    const filterOption = Object.values(newData?.fields || {}).find(
      (item: any) => item?.fields?.filterKey === filterKey,
    );

    for (const value of newValues) {
      const option = filterOption?.options?.find(
        (item: any) => item.fields.options.fields.value === value,
      );

      if (!option) continue;

      newOptimisticSelectedOptions.push({
        ...option,
        filterKey,
        isVisible: (option.value as ProductSorting) !== ProductSorting.DEFAULT,
      });
    }

    startTransition(() => {
      setOptimisticSelectedOptions(newOptimisticSelectedOptions);

      const params = new URLSearchParams();

      for (const selectedOption of newOptimisticSelectedOptions) {
        if (selectedOption.isVisible) {
          params.append(selectedOption.filterKey, selectedOption.value);
        }
      }

      router.push(`/search?${params.toString()}`);
    });

  };

  return (
    <div
      data-pending={isPending ? true : undefined}
      className="flex flex-col gap-4 pb-6"
    >
      {Object.values(newData?.fields || {}).map((item:any, index:number) => {
        let filterInput = null;
        const filterKey = item.fields?.filterKey as keyof typeof values;

        switch (filterKey) {
          case ProductFilterKey.CATEGORIES:
          case ProductFilterKey.PRICE_RANGES: {
            filterInput = (
              <CheckboxGroup
                value={values[filterKey]}
                onChange={(newValue) => {
                  handleChange(filterKey, newValue);
                }}
              >
                {item?.fields?.options?.map((option:any, index:number) => {
                  return (
                    <Checkbox key={index} value={option?.fields?.value}>
                      {option?.fields?.title}
                    </Checkbox>
                  );
                })}
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
                {item?.fields?.options?.map((option:any, index: number) => {
                  return (
                    <RadioGroupItem key={index} value={option?.fields?.value}>
                      {option?.fields?.title}
                    </RadioGroupItem>
                  );
                })}
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
