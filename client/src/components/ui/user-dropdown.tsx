import { useState, useRef, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email?: string;
  mbtiType?: string;
}

interface UserDropdownProps {
  user: User | null;
  onLogout: () => void;
}

export function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const { toast } = useToast();
  
  // ユーザーのイニシャルを取得
  const getUserInitials = (username: string) => {
    if (!username) return "??";
    return username
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    onLogout();
    toast({
      title: "ログアウトしました",
      description: "またのご利用をお待ちしております",
    });
  };

  return (
    <div className="ml-3 relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            type="button" 
            className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            aria-expanded="false"
            aria-haspopup="true"
          >
            <span className="sr-only">ユーザーメニューを開く</span>
            <Avatar>
              <AvatarFallback className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                {user ? getUserInitials(user.username) : "??"}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {user ? (
            <>
              <DropdownMenuItem className="cursor-default">
                <div className="text-sm font-medium">
                  {user.username}
                  {user.mbtiType && <span className="ml-2 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">{user.mbtiType}</span>}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>
                プロフィール
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>
                設定
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleLogout}>
                ログアウト
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onSelect={() => {}}>
                ログイン
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>
                新規登録
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
