import { MainNavigation } from "@/components/ui/main-navigation";
import { Toaster } from "@/components/ui/toaster";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-primary font-bold text-xl">MBTI チームビルダー</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <MainNavigation />
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      <Toaster />
    </div>
  );
}
