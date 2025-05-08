import { Link, useLocation } from "wouter";

interface NavigationItem {
  path: string;
  label: string;
}

const navigationItems: NavigationItem[] = [
  { path: "/", label: "ホーム" },
  { path: "/mbti-types", label: "MBTIタイプ" },
  { path: "/test", label: "診断テスト" },
  { path: "/team-builder", label: "チーム編成・分析" },
];

export function MainNavigation() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12">
          <div className="flex space-x-8 overflow-x-auto">
            {navigationItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link 
                  key={item.path}
                  href={item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                    ${isActive
                      ? "border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
