import { MainNavigation } from "@/components/ui/main-navigation";
import { Toaster } from "@/components/ui/toaster";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with Logo */}
      <header className="bg-background border-b border-border/40 sticky top-0 z-50 shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center gap-2">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 16H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 8C18.2091 8 20 11.5817 20 16C20 20.4183 18.2091 24 16 24C13.7909 24 12 20.4183 12 16C12 11.5817 13.7909 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="logo-text text-2xl font-bold">MindOps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <div className="border-b border-border/40 bg-background">
        <MainNavigation />
      </div>
      
      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      
      <Toaster />
    </div>
  );
}
