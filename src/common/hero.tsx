import {
  APP_DESCRIPTION,
  APP_REPOSITORY_URL,
  APP_TITLE,
} from '@/common/common-utils';
import { ExternalLinkIcon } from '@/common/icons';
import { routes } from '@/routing/routing-utils';
import { ButtonLink } from './button-link';
import { Divider } from './divider';
import { Gem, Sparkles } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
  return (
    <div className="relative overflow-hidden border-b-2 border-yellow-200 dark:border-yellow-900/50 bg-gradient-to-br from-stone-50 via-yellow-50/30 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-yellow-950/20">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-yellow-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-4 w-40 h-40 bg-amber-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-36 h-36 bg-yellow-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex flex-col items-center gap-4 px-4 py-8 sm:py-12 lg:py-16 text-center">
        {/* Logo */}
        <div className="relative group mb-2">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 rounded-full blur-3xl opacity-20 animate-pulse group-hover:opacity-40 transition-opacity"></div>
          <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 flex items-center justify-center group-hover:scale-105 transition-transform duration-700 ease-out">
            <Image 
              src="/images/logo.png" 
              alt="Arif Jewellers Logo"
              width={350}
              height={350}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold tracking-tight">
          <span className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-700 bg-clip-text text-transparent">
            {APP_TITLE}
          </span>
        </h1>

        {/* Description */}
        <div className="flex flex-col items-center max-w-2xl mb-2">
          <p className="text-base sm:text-lg lg:text-xl font-medium text-stone-800 dark:text-stone-200 opacity-90">
            {APP_DESCRIPTION}
          </p>
        </div>

        {/* CTA Button */}
        <ButtonLink 
          variant="primary" 
          href={routes.search()}
          className="group relative px-10 py-4 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 hover:from-yellow-600 hover:via-yellow-500 hover:to-yellow-700 text-stone-900 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-lg border-2 border-white/30"
        >
          <span className="flex items-center gap-2">
            Browse Store
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </span>
        </ButtonLink>
      </div>
    </div>
  );
}
