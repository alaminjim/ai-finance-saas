import { ChevronDown, LogOut } from "lucide-react"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "../ui/avatar"
  import { Button } from "../ui/button"
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "../ui/dropdown-menu"
  
export function UserNav({
  userName,
  profilePicture,
  onLogout,
}: {
  userName: string;
  profilePicture: string;
  onLogout: () => void;
}) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative bg-transparent h-10 w-10 rounded-full p-0 hover:bg-white/10"
          >
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage
                src={profilePicture || ""}
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-700 text-white border border-gray-600">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="w-3 h-3 ml-1 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 bg-gray-800 text-white border-gray-700 z-[9999]"
          align="end"
          sideOffset={5}
        >
          <DropdownMenuLabel className="flex flex-col items-start gap-1">
            <span className="font-semibold">{userName}</span>
            <span className="text-[13px] text-gray-400 font-light">Free Trial (2 days left)</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem 
            className="hover:bg-gray-700 hover:text-white cursor-pointer"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }