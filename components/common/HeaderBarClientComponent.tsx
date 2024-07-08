"use client";

import { Dialog, Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { User } from "@supabase/auth-js";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { signOut } from "@/app/actions/user";
import { usePathname } from "next/navigation";
import { UIModeToggle } from "./UIModeToggle";

export default function HeaderBarClientComponent({
  user,
  isProUser,
}: {
  user: User | null;
  isProUser: boolean;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  let navigation = [];
  if (user) {
    navigation.push(
      {
        name: "Connect An Account",
        href: "/accounts",
      },
      {
        name: "Create Post",
        href: "/create-post",
      }
    );
  } else {
    navigation.push({
      name: "Pricing",
      href: "/pricing",
    });
  }

  if (isProUser) {
    navigation.push({
      name: "Manage Subscription",
      href: "/manage-subscription",
    });
  } else {
    navigation.push({
      name: "Upgrade",
      href: "/pricing",
    });
  }

  useEffect(() => {
    if (pathname) {
      setMobileMenuOpen(false);
    }
  }, [pathname]);

  return (
    <>
      <header className={"w-full z-10"}>
        <nav
          className="flex items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <Link
              href="/"
              className="-m-1.5 p-1.5 flex justify-center items-center gap-2"
            >
              <img
                className="h-8 w-auto"
                src="/logo.png"
                alt="content marketing blueprint logo"
              />
              <p className={` font-bold text-lg`}>Social Queue</p>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className={`h-6 w-6 bg-black `} aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12 lg:justify-end items-center">
            <UIModeToggle />
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-semibold leading-6 `}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-4">
            {user ? (
              <UserButton />
            ) : (
              <Link
                href={"/login"}
                className={`text-sm font-semibold leading-6 `}
              >
                Login
              </Link>
            )}
          </div>
        </nav>
        <Dialog
          as="div"
          className="lg:hidden"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 z-50" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-black  px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                <img
                  className="h-8 w-auto"
                  src={"/logo.png"}
                  alt="Content Marketingi Blueprint  logo"
                />
                <p className={` font-bold text-lg`}>Social Queue</p>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 "
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6 flex">
                  <UIModeToggle />
                  {navigation.map((item) => {
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 "
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
                <div>
                  {user ? (
                    <form action={signOut}>
                      <button
                        className={classNames(
                          "block text-base  w-full text-left font-semibold"
                        )}
                        type={"submit"}
                      >
                        Sign out
                      </button>
                    </form>
                  ) : (
                    <Link
                      href={"/login"}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base  font-semibold leading-7"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>
    </>
  );
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const UserButton = () => (
  <Menu as="div" className="relative ml-3">
    <div>
      <Menu.Button className="relative flex rounded-full bg-secondaryBackground-light dark:bg-secondaryBackground-dark text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
        <span className="absolute -inset-1.5" />
        <span className="sr-only">Open user menu</span>
        <UserCircleIcon className="h-8 w-8" />
      </Menu.Button>
    </div>
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-secondaryBackground-light dark:bg-secondaryBackground-dark py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <Menu.Item>
          {({ active }) => (
            <form action={signOut}>
              <button
                className={classNames(
                  active ? "bg-gray-600" : "",
                  "block px-4 py-2 text-sm  w-full text-right"
                )}
                type={"submit"}
              >
                Sign out
              </button>
            </form>
          )}
        </Menu.Item>
      </Menu.Items>
    </Transition>
  </Menu>
);
