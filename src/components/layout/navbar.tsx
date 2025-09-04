"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full z-20 top-0">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex ml-12 lg:ml-2 md:mr-24">
              <span className="self-center text-lg sm:text-xl lg:text-2xl font-semibold whitespace-nowrap text-indigo-600 dark:text-indigo-400">
                Habit Tracker
              </span>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="flex items-center ml-3">
              <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 mr-4">
                Welcome, {session?.user?.name || session?.user?.email}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  signOut({ redirect: false }).then(() => {
                    window.location.href = "/"
                  })
                }}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}