import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export const UserButton = () => {
  
  const { isLoaded, user } = useUser();
  
  const { signOut, openUserProfile } = useClerk();
  
  const router = useRouter();

  
  if (!isLoaded) return null;
  
  if (!user?.id) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {/* Render a button using the image and email from `user` */}
        <button className="flex flex-row rounded-xl">
          <Image
              alt={user?.primaryEmailAddress?.emailAddress || "User profile image"}
              src={user?.imageUrl}
            width={30}
            height={30}
            className="mr-2 rounded-full border border-gray-200 drop-shadow-sm"
          />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="mt-4 w-52 rounded-xl border border-gray-200 bg-white px-6 py-4 text-black drop-shadow-2xl">
          <DropdownMenu.Label />
          <DropdownMenu.Group className="py-3">
            <DropdownMenu.Item asChild>
              {/* Create a button with an onClick to open the User Profile modal */}
              <button onClick={() => openUserProfile()} className="pb-3">
                Profile
              </button>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              {/* Create a fictional link to /subscriptions */}
              <Link href="/subscriptions" passHref className="py-3">
                Subscription
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.Separator className="my-1 h-px bg-gray-500" />
          <DropdownMenu.Item asChild>
            {/* Create a Sign Out button -- signOut() takes a call back where the user is redirected */}
            <button
              onClick={() => signOut(() => router.push("/"))}
              className="py-3"
            >
              Sign Out{" "}
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
