import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MBTI_TYPES, MbtiType, MbtiGroup } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export default function MbtiTypes() {
  const [filter, setFilter] = useState<MbtiGroup | "all">("all");
  const [selectedType, setSelectedType] = useState<MbtiType | null>(null);
  
  const filteredTypes = filter === "all" 
    ? MBTI_TYPES 
    : MBTI_TYPES.filter(type => type.group === filter);
  
  const getColorClass = (mbtiType: MbtiType) => {
    switch (mbtiType.group) {
      case "分析家気質":
        return "bg-primary/10";
      case "外交官気質":
        return "bg-secondary/10";
      case "番人気質":
        return "bg-accent/10";
      case "探検家気質":
        return "bg-warning/10";
      default:
        return "bg-gray-100";
    }
  };
  
  const getTextColorClass = (mbtiType: MbtiType) => {
    switch (mbtiType.group) {
      case "分析家気質":
        return "text-primary";
      case "外交官気質":
        return "text-secondary";
      case "番人気質":
        return "text-accent";
      case "探検家気質":
        return "text-warning";
      default:
        return "text-gray-700";
    }
  };
  
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">MBTIの16タイプ</h2>
          
          {/* Type grouping tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Button 
              variant={filter === "all" ? "default" : "outline"} 
              onClick={() => setFilter("all")}
            >
              すべて
            </Button>
            <Button 
              variant={filter === "分析家気質" ? "default" : "outline"} 
              onClick={() => setFilter("分析家気質")}
            >
              分析家気質
            </Button>
            <Button 
              variant={filter === "外交官気質" ? "default" : "outline"} 
              onClick={() => setFilter("外交官気質")}
            >
              外交官気質
            </Button>
            <Button 
              variant={filter === "番人気質" ? "default" : "outline"} 
              onClick={() => setFilter("番人気質")}
            >
              番人気質
            </Button>
            <Button 
              variant={filter === "探検家気質" ? "default" : "outline"} 
              onClick={() => setFilter("探検家気質")}
            >
              探検家気質
            </Button>
          </div>
          
          {/* MBTI Types Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTypes.map((mbtiType) => (
              <Card 
                key={mbtiType.code}
                className="border border-gray-200 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedType(mbtiType)}
              >
                <div className={`${getColorClass(mbtiType)} px-4 py-3`}>
                  <h3 className={`text-lg font-bold ${getTextColorClass(mbtiType)}`}>
                    {mbtiType.code}
                  </h3>
                  <p className="text-sm text-gray-600">{mbtiType.name}</p>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {mbtiType.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mbtiType.traits.map((trait, idx) => (
                      <Badge key={idx} variant="outline" className="bg-gray-100">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                  <button className="block w-full text-center mt-3 text-sm text-primary hover:underline">
                    詳細を見る
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Type Detail Dialog */}
          <Dialog open={!!selectedType} onOpenChange={(open) => !open && setSelectedType(null)}>
            {selectedType && (
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className={`flex items-center gap-2 ${getTextColorClass(selectedType)}`}>
                    {selectedType.code} - {selectedType.name}
                    <Badge>{selectedType.group}</Badge>
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    {selectedType.description}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">主な特徴</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {selectedType.traits.map((trait, idx) => (
                      <li key={idx}>{trait}</li>
                    ))}
                    {/* 追加の特徴をここに記述 */}
                    <li>自分の考えに自信を持っている</li>
                    <li>独立心が強く、自分のペースで作業することを好む</li>
                    <li>長期的な視点で物事を見る傾向がある</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">強み</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    <li>論理的思考に長けている</li>
                    <li>複雑な問題を整理して解決する能力が高い</li>
                    <li>目標に向かって粘り強く取り組める</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">課題</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    <li>感情表現が苦手な場合がある</li>
                    <li>完璧主義の傾向がある</li>
                    <li>他者の意見を受け入れるのに抵抗を感じることがある</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">チームでの役割</h4>
                  <p className="text-sm text-gray-700">
                    戦略策定や長期ビジョンの設計に貢献します。複雑な問題の分析や、プロジェクトの全体像を把握するのに優れています。
                  </p>
                </div>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>
    </section>
  );
}
