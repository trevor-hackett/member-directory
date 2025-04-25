import { Input } from "~/components/ui/input";
import type { Route } from "./+types/home";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { searchMembers, type Member } from "~/lib/cache.server";
import { Form, useSubmit } from "react-router";
import { SearchIcon } from "lucide-react";
import { Link } from "~/components/ui/link";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const filter = searchParams.get("filter")?.trim() || "";

  const members = await searchMembers(filter);

  return {
    members,
    filter,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { members, filter } = loaderData;
  const submit = useSubmit();

  return (
    <>
      <Card className="@container">
        <CardContent className="space-y-8">
          <h1 className="text-3xl font-bold">Member Directory</h1>
          <Form
            method="get"
            onChange={(e) => submit(e.currentTarget)}
            className="relative"
          >
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search members..."
              name="filter"
              defaultValue={filter}
              className="pl-10"
            />
          </Form>

          <div className="grid @sm:grid-cols-2 @2xl:grid-cols-4 @4xl:grid-cols-5 gap-6">
            {members.results.length === 0 ? (
              <div className="col-span-full">
                <p className="text-center text-muted-foreground">
                  No members found.
                </p>
              </div>
            ) : (
              members.results.map((member) => (
                <ContactCard member={member} key={member.login.uuid} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export function ContactCard({ member }: { member: Member }) {
  return (
    <Link to={`/members/${member.login.uuid}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md p-0">
        <CardContent className="p-0">
          <div className="flex flex-col">
            <div className="relative aspect-square w-full overflow-hidden">
              <Avatar className="h-full w-full rounded-none">
                <AvatarImage
                  src={member.picture.large}
                  alt={`${member.name.first} ${member.name.last}`}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-none text-2xl">
                  {member.name.first[0]}
                  {member.name.last[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="p-4">
              <h3 className="font-medium truncate">
                {`${member.name.first} ${member.name.last}`}
              </h3>
              <p className="text-sm text-muted-foreground">
                {member.dob.age} years old
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
