'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { logout } from "@/app/actions/session"
import type { CurrentUser } from "@/app/actions/session"

function getInitials(value?: string) {
  const text = value?.trim()
  if (!text) return "US"
  const parts = text.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? ""
  return (first + second).toUpperCase()
}

export function UserDropdown({ user }: { user?: CurrentUser }) {
  const displayName =
    user?.isAuthenticated ? (user.name ?? "User") : "User"
  const displayEmail =
    user?.isAuthenticated ? (user.email ?? "") : ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 rounded-full px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/images/avatar.png" alt={displayName} />
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col items-start leading-tight">
            <span className="max-w-[160px] truncate text-sm font-medium">
              {displayName}
            </span>
            {displayEmail ? (
              <span className="max-w-[160px] truncate text-xs text-muted-foreground">
                {displayEmail}
              </span>
            ) : null}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link 
              href={user?.type === "customer" ? "/customer-panel/dashboard" : "/listpesanan"}
            >
              Pesanan
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              href={user?.type === "customer" ? "/customer-panel/pesanan?tab=history" : "/listpesanan?tab=history"}
            >
              History
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              href={user?.type === "customer" ? "/customer-panel/settings" : "/profilcust"}
            >
              Profile
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600 cursor-pointer"
            onClick={() => logout()}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
