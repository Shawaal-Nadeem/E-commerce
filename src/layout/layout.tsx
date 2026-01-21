import type { ButtonLinkProps } from '@/common/button-link';
import { ButtonLink } from '@/common/button-link';
import { APP_REPOSITORY_URL, APP_TITLE } from '@/common/common-utils';
import { Container } from '@/common/container';
import { GithubIcon, HomeIcon, SearchIcon } from '@/common/icons';
import { NextLink } from '@/routing/next-link';
import { ThemeToggle } from '@/styles/theme-toggle';
import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { createClient } from 'contentful';

import Image from 'next/image';

type LayoutProps = React.PropsWithChildren;

export function Layout({ children }: LayoutProps) {
  return (
    <div className="grid min-h-screen grid-rows-[1fr_auto]">{children}</div>
  );
}

type LayoutHeaderProps = React.PropsWithChildren;

export async function LayoutHeader({ children }: LayoutHeaderProps) {
  
  return (
    <header className="fixed z-10 h-app-header w-full border-b border-yellow-200/50 dark:border-yellow-900/30 bg-white/80 dark:bg-stone-950/80 backdrop-blur-lg shadow-sm">
      <Container
        maxWidth="xl"
        className="flex h-full items-center justify-between px-4"
      >
        <NextLink href="/" className="flex items-center gap-3 group">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image 
              src="/images/logo.png" 
              alt="Arif Jewellers Logo"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-2xl sm:text-3xl font-serif font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-700 bg-clip-text text-transparent">
            {APP_TITLE}
          </span>
        </NextLink>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {children}
        </div>
      </Container>
    </header>
  );
}

type LayoutContentProps = React.PropsWithChildren<{
  className?: string;
}>;

export function LayoutContent({ className, children }: LayoutContentProps) {
  return (
    <Container maxWidth="xl" className={twMerge('py-2 md:p-4', className)}>
      {children}
    </Container>
  );
}

type MobileNavButtonBaseProps = Pick<
  ButtonLinkProps,
  'variant' | 'className' | 'iconAlignment' | 'icon'
>;

export function getMobileNavButtonBaseProps({
  icon,
}: {
  icon: LucideIcon;
}): MobileNavButtonBaseProps {
  const Icon = icon;

  return {
    variant: 'transparent',
    className: 'w-full py-1 text-xs',
    iconAlignment: 'top',
    icon: <Icon size="1.65rem" />,
  };
}

const mobileNavLinks = [
  { href: '/', title: 'Home', icon: HomeIcon },
  { href: '/search', title: 'Search', icon: SearchIcon },
];

type LayoutFooterProps = React.PropsWithChildren;

export function LayoutFooter({ children }: LayoutFooterProps) {
  return (
    <footer className="pb-16 md:pb-0 border-t border-yellow-200 dark:border-yellow-900/50 bg-gradient-to-br from-stone-50 via-yellow-50/50 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-yellow-950/30">
      <Container
        maxWidth="xl"
        className="flex items-center justify-between px-4 py-10"
      >
        <p className="text-stone-600 dark:text-stone-400 font-medium">
          {new Date().getFullYear()} © <span className="font-semibold">{APP_TITLE}</span>
        </p>
        <ButtonLink
          aria-label="Check the Source Code on GitHub"
          // TODO: GitHub icon is deprecated.
          // eslint-disable-next-line deprecation/deprecation
          icon={<GithubIcon />}
          href={APP_REPOSITORY_URL}
          isExternalUrl
          className="text-stone-500 hover:text-yellow-600 dark:text-stone-500 dark:hover:text-yellow-500 transition-colors"
        />
      </Container>
      <nav className="fixed bottom-0 z-10 w-full border-t border-yellow-200/50 dark:border-yellow-900/30 bg-white/80 dark:bg-stone-950/80 backdrop-blur-lg p-1 md:hidden shadow-lg">
        <ul className="flex justify-between items-center px-16">
          {mobileNavLinks.map((link) => {
            return (
              <li key={link.href}>
                <ButtonLink
                  href={link.href}
                  {...getMobileNavButtonBaseProps({ icon: link.icon })}
                  className="py-1 text-xs text-stone-600 dark:text-stone-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/30"
                >
                  {link.title}
                </ButtonLink>
              </li>
            );
          })}
          {/* Cart hidden as per client request */}
          {/* <li>
            <div>{children}</div>
          </li> */}
        </ul>
      </nav>
    </footer>
  );
}
