import { useState, useRef, useEffect } from "react"
import { ChevronDown, LogOut, CreditCard, Crown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "../ui/avatar"
  import { Button } from "../ui/button"
  import { useGetSubscriptionQuery } from "@/features/billing"
  
export function UserNav({
  userName,
  profilePicture,
  onLogout,
}: {
  userName: string;
  profilePicture: string;
  onLogout: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { data: subscription } = useGetSubscriptionQuery()

  // Debug subscription data
  useEffect(() => {
    console.log('UserNav - Subscription data:', subscription);
    console.log('UserNav - Subscription status:', subscription?.data?.status);
    console.log('UserNav - Subscription plan:', subscription?.data?.plan);
  }, [subscription]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    onLogout()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="relative bg-transparent h-10 w-10 rounded-full p-0 hover:bg-white/10"
        onClick={() => setIsOpen(!isOpen)}
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
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-gray-800 text-white border border-gray-700 rounded-md shadow-lg z-[9999]">
          <div className="px-3 py-2 border-b border-gray-700">
            <div className="font-semibold">{userName}</div>
            <div className="text-[13px] text-gray-400 font-light flex items-center gap-1">
              {subscription?.data?.status === 'active' ? (
                <>
                  <Crown className="w-3 h-3 text-yellow-500" />
                  {subscription?.data?.plan === 'LIFETIME' ? 'Lifetime Plan' : 'Premium Plan'}
                </>
              ) : (
                'Free Trial (2 days left)'
              )}
            </div>
          </div>
          <button
            className="w-full px-3 py-2 text-left hover:bg-gray-700 hover:text-white cursor-pointer flex items-center"
            onClick={() => {
              navigate('/settings/billing')
              setIsOpen(false)
            }}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </button>
          <button
            className="w-full px-3 py-2 text-left hover:bg-gray-700 hover:text-white cursor-pointer flex items-center"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}