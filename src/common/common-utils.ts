// 'use client'
import type { Nil } from './common-types';
import { createClient } from 'contentful';

async function getWebInfo(){
  const spaceId = process.env.NEXT_PUBLIC_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENT_DELIVERY_API;
  let appInfo:any;
  const client = createClient({
    space: spaceId as string,
    accessToken: accessToken as string,
  });

  try {
    const webInfo = await client.getEntries({
      content_type: 'webInfo',
    });
    appInfo = webInfo?.items[0];
    return appInfo;
}
catch (error) {
  console.error('Error fetching data from Contentful:', error);
}
}

const appInfo = await getWebInfo();
// console.log(appInfo);
let appURL:string = appInfo?.fields?.websiteDomainLink;
let appTitle:string = appInfo?.fields?.websiteName;
let appDescription:string = appInfo?.fields?.websiteDescription;
let appRepositoryURL:string = appInfo?.fields?.socialLink;
export const APP_URL = appURL;
export const APP_TITLE = appTitle;
export const APP_DESCRIPTION = appDescription;
export const APP_REPOSITORY_URL = appRepositoryURL;

export const createMockArray = (length: number) => {
  // eslint-disable-next-line unicorn/prefer-spread
  return Array.from(Array.from({ length }).keys());
};

export const isNil = (value: unknown): value is Nil => {
  return value === null || value === undefined;
};
