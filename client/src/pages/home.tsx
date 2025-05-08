import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MBTI_AXES } from "@/lib/constants";
import { Link } from "wouter";

export default function Home() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              MBTIを活用した<span className="text-primary">チームビルディング</span>
            </h1>
            <p className="mt-3 text-lg text-gray-500">
              MBTIタイプを理解し、より良いチーム編成と相互理解を促進しましょう
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/test">
                <Button size="lg" className="px-6">
                  診断テストを受ける
                </Button>
              </Link>
              <Link href="/mbti-types">
                <Button variant="outline" size="lg" className="px-6">
                  MBTIタイプを学ぶ
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Feature Card 1 */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary/10 rounded-md p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">自己理解の促進</h3>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  MBTIタイプを知ることで、自分の強みや行動パターンをより深く理解できます。
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 2 */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-secondary/10 rounded-md p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">チーム構築の最適化</h3>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  メンバーの相性を考慮したチーム編成により、より効果的な協力体制を構築できます。
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 3 */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-accent/10 rounded-md p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">コミュニケーション向上</h3>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  異なるタイプの考え方や価値観を理解し、円滑なコミュニケーションを実現します。
                </p>
              </CardContent>
            </Card>
          </div>

          {/* MBTI Overview */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">MBTIとは</h2>
            <p className="mt-4 text-lg text-gray-500">
              MBTIは「Myers-Briggs Type Indicator」の略で、C.G.ユングの理論を基にして開発された性格タイプ論です。人の認知機能や行動パターンを4つの軸で分類し、全部で16のタイプに分けています。
            </p>
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {MBTI_AXES.map((axis, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-primary">{axis.axis}</h3>
                    <p className="text-sm mt-1">{axis.title}</p>
                    <p className="text-xs text-gray-500 mt-2">{axis.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
