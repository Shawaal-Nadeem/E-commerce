import { createSafeContext } from '@/common/safe-context';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { useId, useState } from 'react';
import { Label } from './label';
import { useContext } from 'react';
import { context } from '@/contextAPI/contextAPI';

type CheckboxGroupContextValue = {
  value: string[];
  onChange: (value: string[]) => void;
};

const [CheckboxGroupContext, useCheckboxGroupContext] = createSafeContext<CheckboxGroupContextValue>({
  displayName: 'CheckboxGroupContext',
});

type CheckboxGroupProps = CheckboxGroupContextValue & React.PropsWithChildren & {
  hideCheckboxIcon?: boolean;
};

export function CheckboxGroupCategories({
  children,
  value,
  onChange,
  hideCheckboxIcon = false,
}: CheckboxGroupProps) {
  return (
    <CheckboxGroupContext.Provider value={{ value, onChange }}>
      <div className="flex flex-col gap-2">{children}</div>
    </CheckboxGroupContext.Provider>
  );
}

type CheckboxProps = {
  value: string;
  children: React.ReactNode;
};

export function CheckboxCat({ value, children }: CheckboxProps) {
  const { value: groupValue, onChange } = useCheckboxGroupContext();
    const getContext = useContext(context);
    const isToggled = getContext.isToggled;
    const setIsToggled = getContext.setIsToggled;
  const checked = groupValue.includes(value);
  const id = useId();

  const handleCheckedChange = (checked: boolean) => {
    const newValue = checked ? [...groupValue, value] : groupValue.filter((v) => v !== value);
    onChange(newValue);
  };

  
//   console.log('isToggled: ', isToggled);
  return (
    <div
      className={`group flex gap-2 p-2 transition justify-center `} 
      
    >
      {/* The checkbox is hidden but still functional for the underlying logic */}
      <RadixCheckbox.Root
        id={id}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        className="hidden" // Hide the checkbox input visually
      />

<button
  className="relative cursor-pointer opacity-90 hover:opacity-100 transition-opacity p-[2px] rounded-lg dark:bg-[#1DED81] bg-[#0B8445] active:scale-95"
>
  <span
    className=" flex items-center w-56 rounded-md dark:bg-[#1DED81] bg-[#0B8445]"
  >
      <Label
        className={`cursor-pointer pt-2 pb-2 text-center w-56 rounded-md dark:text-black text-white font-bold  ${checked ? '' : ''}`}
        htmlFor={id}
      >
           {children}

      </Label>
  </span>
</button>
    </div>
  );
}
