import { Button } from '@/common/button';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerTrigger,
} from '@/common/drawer';
import { FilterIcon } from '@/common/icons';
import { MobilePadding } from '@/common/mobile-padding';

type ProductFilterDrawerProps = React.PropsWithChildren;

export function ProductFilterDrawer({ children }: ProductFilterDrawerProps) {
  return (
    <Drawer
      closeOnPathnameChange
      trigger={
        <MobilePadding className="flex justify-end md:hidden">
          <DrawerTrigger asChild>
            <Button 
              icon={<FilterIcon size="1.2rem" />}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-stone-950 font-bold border-2 border-white/20 shadow-lg"
            >
              Filter
            </Button>
          </DrawerTrigger>
        </MobilePadding>
      }
    >
      <DrawerHeader className="border-b border-yellow-200/50 dark:border-yellow-900/30 bg-stone-50 dark:bg-stone-950">
        <h2 className="text-xl font-serif font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
          Product Filter
        </h2>
      </DrawerHeader>
      <DrawerBody className="bg-gradient-to-br from-white to-yellow-50/20 dark:from-stone-900 dark:to-stone-950">{children}</DrawerBody>
    </Drawer>
  );
}
