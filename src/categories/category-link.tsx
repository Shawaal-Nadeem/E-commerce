import type { NextLinkProps } from '@/routing/next-link';
import { NextLink } from '@/routing/next-link';
import { Sparkles } from 'lucide-react';

type CategoryLinkProps = Pick<NextLinkProps, 'href'> & {
  imageSrc: string;
  title: string;
  color: string;
};

export function CategoryLink({
  href,
  imageSrc,
  title,
  color,
}: CategoryLinkProps) {
  return (
    <NextLink
      className="group relative block h-80 sm:h-96 overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-yellow-200 dark:border-yellow-900/30"
      href={href}
    >
      <div
        className="absolute inset-0 grid place-items-center bg-cover bg-center bg-blend-luminosity transition duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${imageSrc})`, backgroundColor: color }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
      
      {/* Sparkle effect on hover */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
      </div>
      
      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white drop-shadow-2xl group-hover:scale-105 transition-transform duration-500">
          {title}
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </NextLink>
  );
}
