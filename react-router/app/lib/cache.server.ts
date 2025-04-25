import type { Cache, CacheEntry } from "@epic-web/cachified";
import { configure, totalTtl } from "@epic-web/cachified";
import { LRUCache } from "lru-cache";
import { z } from "zod";

const lruInstance = new LRUCache<string, CacheEntry>({ max: 1000 });

export const cache: Cache = {
  set(key, value) {
    const ttl = totalTtl(value?.metadata);
    return lruInstance.set(key, value, {
      ttl: ttl === Number.POSITIVE_INFINITY ? undefined : ttl,
      start: value?.metadata?.createdTime,
    });
  },
  get(key) {
    return lruInstance.get(key);
  },
  delete(key) {
    return lruInstance.delete(key);
  },
};

export const cachified = configure({
  cache,
});

const API_URL = "https://randomuser.me/api/?seed=myappseed&results=20";

export const memberSchema = z.object({
  gender: z.string(),
  name: z.object({
    title: z.string(),
    first: z.string(),
    last: z.string(),
  }),
  location: z.object({
    street: z.object({
      number: z.number(),
      name: z.string(),
    }),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postcode: z.union([z.string(), z.number()]),
  }),
  email: z.string().email(),
  login: z.object({
    uuid: z.string(),
  }),
  dob: z.object({
    date: z.string(),
    age: z.number(),
  }),
  phone: z.string(),
  cell: z.string(),
  id: z.object({
    name: z.string().nullable(),
    value: z.string().nullable(),
  }),
  picture: z.object({
    large: z.string(),
    medium: z.string(),
    thumbnail: z.string(),
  }),
  nat: z.string(),
});

export type Member = z.infer<typeof memberSchema>;

export const apiResponseSchema = z.object({
  results: z.array(memberSchema),
  info: z.object({
    seed: z.string(),
    results: z.number(),
    page: z.number(),
    version: z.string(),
  }),
});

export async function getMembers() {
  return cachified({
    key: "members",
    async getFreshValue() {
      const response = await fetch(API_URL);
      const data = await response.json();
      const members = apiResponseSchema.parse(data);

      // sort members by name
      members.results.sort((a, b) => {
        const nameA = `${a.name.first} ${a.name.last}`.toLowerCase();
        const nameB = `${b.name.first} ${b.name.last}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });

      return members;
    },
  });
}

export async function searchMembers(filter: string) {
  const members = await getMembers();
  const filteredMembers = members.results.filter((member) => {
    // Check if the filter is empty or if the member's name includes the filter
    if (!filter) return true;

    const name = `${member.name.first} ${member.name.last}`.toLowerCase();
    return name.includes(filter.toLowerCase());
  });

  return { ...members, results: filteredMembers };
}

export async function getMember(id: string) {
  const members = await getMembers();
  const member = members.results.find((member) => member.login.uuid === id);

  return member;
}
