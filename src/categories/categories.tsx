import { getManyCategories } from '@/categories/category-fetchers';
import { routes } from '@/routing/routing-utils';
import { CategoryLink } from './category-link';
import { Temp } from '@/app/temp';

export async function Categories({categories}:any) {

  // const oldData = await getManyCategories();
  // console.log("oldData", oldData);
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      <Temp data = {categories}/>
      {categories?.map((item:any, index:number) => {
        return (
          <li key={index}>
            <CategoryLink
              href={routes.search({
                query: { categories: [item.fields.slug] },
              })}
              imageSrc={item.fields.categoryImage.fields.file.url}
              title={item.fields.categoryName}
              color={item.fields.overlayColor}
            />
          </li>
        );
      })}
    </ul>
  );
}
