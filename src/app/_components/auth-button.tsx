"use client";

import { useSession, signIn } from "next-auth/react";
import { UserCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/texturebutton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <Link href="/settings">
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-4 right-4 h-10 w-10 rounded-full"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={session.user.image ?? undefined} />
            <AvatarFallback>
              {session.user.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </Link>
    );
  }

  return (
    <Button
      onClick={() => void signIn("google")}
      variant="icon"
      size="icon"
      className="fixed bottom-4 right-4 h-10 w-10 rounded-full"
    >
      <UserCircle />
    </Button>
  );
} 