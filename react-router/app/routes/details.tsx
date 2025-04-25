import { getMember } from "~/lib/cache.server";
import type { Route } from "./+types/details";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { useLocation, useNavigate } from "react-router";
import { CalendarIcon, HomeIcon, MailIcon, PhoneIcon } from "lucide-react";
import { useCallback } from "react";
import { Link } from "react-router";

export async function loader({ params }: Route.LoaderArgs) {
  const member = await getMember(params.id);

  if (!member) {
    throw new Response("Not Found", { status: 404 });
  }

  return { member };
}

export default function Details({ loaderData }: Route.ComponentProps) {
  const { member } = loaderData;
  const goBack = useGoBack("/");

  const address = `${member.location.street.number} ${member.location.street.name}, ${member.location.city}, ${member.location.state}, ${member.location.country}`;

  return (
    <>
      <Button asChild variant="ghost" className="mb-4">
        <Link to="/" onClick={goBack}>
          ← Back to members
        </Link>
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <Avatar className="h-48 w-48 rounded-lg">
                <AvatarImage
                  src={member.picture.large || "/placeholder.svg"}
                  alt={`${member.name.first} ${member.name.last}`}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl rounded-lg">
                  {member.name.first[0]}
                  {member.name.last[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{`${member.name.first} ${member.name.last}`}</h1>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MailIcon className="size-4" />
                  <span>{member.email}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <PhoneIcon className="size-4" />
                  <span>{member.cell}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <HomeIcon className="size-4" />
                  <span>{address}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="size-4" />
                  <span>Born: {member.dob.date}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

const useGoBack = (fallback: string) => {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    if (location.state.canGoBack) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  }, [location, fallback]);
};

export function ErrorBoundary() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Error</h1>
      <p>Something went wrong.</p>
    </div>
  );
}
