import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  getCompatibility, 
  getCompatibilityColorClass, 
  PROJECT_TYPES,
  DEVELOPMENT_PHASES
} from "@/lib/constants";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

// 役割とスキルの選択肢
const ROLE_OPTIONS = [
  "リーダー",
  "プロジェクトマネージャー",
  "アナリスト",
  "システムアナリスト",
  "コミュニケーター",
  "デザイナー",
  "マーケティングディレクター",
  "オーガナイザー",
  "イノベーター",
  "エンジニア",
  "開発者",
  "テスター",
  "メンバー",
  "その他"
];

const SKILL_OPTIONS = [
  "プロジェクト管理",
  "リーダーシップ",
  "分析",
  "問題解決",
  "技術開発",
  "コミュニケーション",
  "チームビルディング",
  "創造性",
  "構造化思考",
  "組織化",
  "プログラミング",
  "デザイン",
  "マーケティング",
  "調査",
  "文書作成",
  "交渉",
  "計画立案",
  "その他"
];

interface TeamMember {
  id: number;
  username: string;
  mbtiType: string;
  selected: boolean;
  role?: string;
  skills?: string[];
}

export default function TeamBuilder() {
  const { toast } = useToast();
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("setup");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 1,
      username: "山田 拓也",
      mbtiType: "ENTJ",
      selected: true,
      role: "プロジェクトマネージャー",
      skills: ["プロジェクト管理", "リーダーシップ", "コミュニケーション", "計画立案"]
    },
    {
      id: 2,
      username: "鈴木 健太",
      mbtiType: "INTJ",
      selected: true,
      role: "アーキテクト",
      skills: ["システム設計", "技術開発", "構造化思考", "問題解決"]
    },
    {
      id: 3,
      username: "佐藤 美咲",
      mbtiType: "ENFP",
      selected: true,
      role: "デザイナー",
      skills: ["デザイン", "創造性", "コミュニケーション", "ユーザー体験"]
    },
    {
      id: 4,
      username: "高橋 直樹",
      mbtiType: "ISTP",
      selected: true,
      role: "開発者",
      skills: ["プログラミング", "問題解決", "技術開発", "デバッグ"]
    },
    {
      id: 5,
      username: "中村 綾子",
      mbtiType: "ISTJ",
      selected: true,
      role: "テスター",
      skills: ["品質保証", "組織化", "文書作成", "分析"]
    }
  ]);
  const [newMember, setNewMember] = useState({
    name: "",
    mbtiType: "",
    role: "",
    skills: [] as string[]
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // メンバー削除機能
  const handleDeleteMember = (memberId: number) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    
    toast({
      title: "メンバーを削除しました",
      description: "チームメンバーリストから削除されました。",
    });
  };
  
  const handleMemberSelection = (memberId: number, selected: boolean) => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, selected } 
          : member
      )
    );
  };
  
  // スキルのトグル
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    } else {
      setSelectedSkills(prev => [...prev, skill]);
    }
  };
  
  // 新しく追加される関数群
  // チームの強みフェーズを取得
  const getTeamStrengthPhase = () => {
    if (selectedMembers.length === 0) return "不明";
    
    // 各フェーズの適合度を計算
    const phaseScores = DEVELOPMENT_PHASES.map(phase => {
      const suitableMembers = selectedMembers.filter(member => 
        phase.recommendedMbtiTypes.includes(member.mbtiType)
      );
      return {
        id: phase.id,
        name: phase.name,
        score: suitableMembers.length / selectedMembers.length
      };
    });
    
    // 最も高いスコアのフェーズを返す
    const bestPhase = phaseScores.reduce((prev, current) => 
      current.score > prev.score ? current : prev, 
      phaseScores[0]
    );
    
    return bestPhase.name;
  };
  
  // MBTI分布とプロジェクトの理想分布間のギャップを計算
  const calculateMbtiGap = (
    actualDistribution: ReturnType<typeof calculateMbtiDistribution>, 
    idealDistribution: any
  ) => {
    let totalGap = 0;
    let factorsCount = 0;
    
    // E vs I ギャップ
    if (idealDistribution.E && idealDistribution.I) {
      const totalMembers = actualDistribution.eVsI.E + actualDistribution.eVsI.I;
      if (totalMembers > 0) {
        const actualEPercentage = (actualDistribution.eVsI.E / totalMembers) * 100;
        const gapE = Math.abs(actualEPercentage - idealDistribution.E);
        totalGap += gapE;
        factorsCount++;
      }
    }
    
    // S vs N ギャップ
    if (idealDistribution.S && idealDistribution.N) {
      const totalMembers = actualDistribution.sVsN.S + actualDistribution.sVsN.N;
      if (totalMembers > 0) {
        const actualSPercentage = (actualDistribution.sVsN.S / totalMembers) * 100;
        const gapS = Math.abs(actualSPercentage - idealDistribution.S);
        totalGap += gapS;
        factorsCount++;
      }
    }
    
    // T vs F ギャップ
    if (idealDistribution.T && idealDistribution.F) {
      const totalMembers = actualDistribution.tVsF.T + actualDistribution.tVsF.F;
      if (totalMembers > 0) {
        const actualTPercentage = (actualDistribution.tVsF.T / totalMembers) * 100;
        const gapT = Math.abs(actualTPercentage - idealDistribution.T);
        totalGap += gapT;
        factorsCount++;
      }
    }
    
    // J vs P ギャップ
    if (idealDistribution.J && idealDistribution.P) {
      const totalMembers = actualDistribution.jVsP.J + actualDistribution.jVsP.P;
      if (totalMembers > 0) {
        const actualJPercentage = (actualDistribution.jVsP.J / totalMembers) * 100;
        const gapJ = Math.abs(actualJPercentage - idealDistribution.J);
        totalGap += gapJ;
        factorsCount++;
      }
    }
    
    // 平均ギャップを返す (0-100 の値)
    return factorsCount > 0 ? totalGap / factorsCount : 0;
  };
  
  // スキルギャップを計算 (理想的なスキルセットとの差)
  const calculateSkillGap = (members: TeamMember[], requiredSkills: string[]) => {
    if (members.length === 0 || requiredSkills.length === 0) return 100; // 最大ギャップ
    
    // チーム内の全スキルを集計
    const teamSkills = new Set<string>();
    members.forEach(member => {
      if (member.skills && Array.isArray(member.skills)) {
        member.skills.forEach(skill => teamSkills.add(skill));
      }
    });
    
    // カバーされているスキルの割合を計算
    const coveredSkills = requiredSkills.filter(skill => 
      teamSkills.has(skill) || Array.from(teamSkills).some(s => 
        s.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(s.toLowerCase())
      )
    );
    
    // スキルギャップを計算 (0-100 の値)
    return 100 - (coveredSkills.length / requiredSkills.length) * 100;
  };
  
  // プロジェクト適合度に応じた色クラスを取得
  const getProjectFitColorClass = (percentage: number) => {
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };
  
  // プロジェクト適合度に応じたグラデーションクラスを取得
  const getProjectFitGradient = (percentage: number) => {
    if (percentage >= 70) return "bg-gradient-to-r from-green-400 to-green-600";
    if (percentage >= 40) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    return "bg-gradient-to-r from-red-400 to-red-600";
  };
  
  // チームが特定の役割を持っているか確認
  const hasRoleInTeam = (role: string) => {
    return selectedMembers.some(member => 
      member.role === role || 
      (member.role && member.role.toLowerCase().includes(role.toLowerCase()))
    );
  };
  
  // チームが特定のスキルを持っているか確認
  const hasSkillInTeam = (skill: string) => {
    return selectedMembers.some(member => 
      member.skills && Array.isArray(member.skills) && (
        member.skills.includes(skill) || 
        member.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      )
    );
  };
  
  // ギャップ分析に基づいた推奨事項を取得
  const getBestRecommendation = (projectType: any) => {
    if (selectedMembers.length === 0) {
      return <p className="text-sm text-gray-500">チームメンバーが選択されていないため、分析できません。</p>;
    }
    
    // 足りない役割を検出
    const missingRoles = projectType.recommendedRoles.filter((role: string) => !hasRoleInTeam(role));
    
    // 足りないスキルを検出
    const missingSkills = projectType.keySkills.filter((skill: string) => !hasSkillInTeam(skill));
    
    // MBTI分布の最適化提案
    const mbtiSuggestion = getMbtiBalanceSuggestion(mbtiDistribution, projectType.idealMbtiDistribution);
    
    return (
      <div className="space-y-2 text-sm">
        {missingRoles.length > 0 && (
          <p>
            <span className="font-medium">不足している役割: </span>
            {missingRoles.join('、')}
          </p>
        )}
        
        {missingSkills.length > 0 && (
          <p>
            <span className="font-medium">不足しているスキル: </span>
            {missingSkills.join('、')}
          </p>
        )}
        
        {mbtiSuggestion && (
          <p>
            <span className="font-medium">MBTI推奨: </span>
            {mbtiSuggestion}
          </p>
        )}
        
        {missingRoles.length === 0 && missingSkills.length === 0 && !mbtiSuggestion && (
          <p className="text-green-600">
            このプロジェクトに適したバランスの取れたチーム構成です！
          </p>
        )}
      </div>
    );
  };
  
  // MBTI分布の最適化提案を取得
  const getMbtiBalanceSuggestion = (
    actual: ReturnType<typeof calculateMbtiDistribution>, 
    ideal: any
  ) => {
    if (!ideal) return null;
    
    const suggestions = [];
    
    // E vs I バランス
    const totalEI = actual.eVsI.E + actual.eVsI.I;
    if (totalEI > 0) {
      const actualEPercentage = (actual.eVsI.E / totalEI) * 100;
      if (ideal.E && Math.abs(actualEPercentage - ideal.E) > 20) {
        if (actualEPercentage < ideal.E) {
          suggestions.push("もっと外向的(E)なメンバーを追加すると良いでしょう");
        } else {
          suggestions.push("もっと内向的(I)なメンバーを追加すると良いでしょう");
        }
      }
    }
    
    // S vs N バランス
    const totalSN = actual.sVsN.S + actual.sVsN.N;
    if (totalSN > 0) {
      const actualSPercentage = (actual.sVsN.S / totalSN) * 100;
      if (ideal.S && Math.abs(actualSPercentage - ideal.S) > 20) {
        if (actualSPercentage < ideal.S) {
          suggestions.push("もっと現実的(S)なメンバーを追加すると良いでしょう");
        } else {
          suggestions.push("もっと直感的(N)なメンバーを追加すると良いでしょう");
        }
      }
    }
    
    // 最大2つの提案に制限
    if (suggestions.length > 0) {
      return suggestions.slice(0, 2).join('、また');
    }
    return null;
  };
  
  // チーム全体のレーダーチャートデータを取得
  const getTeamRadarData = () => {
    if (selectedMembers.length === 0) return [];
    
    const axes = [
      { axis: "分析力", key: "analysis" },
      { axis: "創造性", key: "creativity" },
      { axis: "リーダーシップ", key: "leadership" },
      { axis: "実行力", key: "execution" },
      { axis: "協調性", key: "harmony" },
      { axis: "細部への配慮", key: "detail" }
    ];
    
    // 各能力の評価を MBTI タイプから計算
    const calculateMbtiAxisValue = (members: TeamMember[], axisKey: string) => {
      let value = 0;
      
      members.forEach(member => {
        const mbti = member.mbtiType;
        
        // 各 MBTI タイプと能力の対応付け（スコアは 0-10 の範囲）
        switch (axisKey) {
          case "analysis":
            if (mbti.includes("NT")) value += 8;
            else if (mbti.includes("ST")) value += 6;
            else if (mbti.includes("NF")) value += 4;
            else value += 2;
            break;
          case "creativity":
            if (mbti.includes("NP")) value += 9;
            else if (mbti.includes("NF")) value += 7;
            else if (mbti.includes("NT")) value += 6;
            else value += 3;
            break;
          case "leadership":
            if (mbti.includes("ETJ")) value += 9;
            else if (mbti.includes("ENJ")) value += 8;
            else if (mbti.includes("EST")) value += 6;
            else value += 3;
            break;
          case "execution":
            if (mbti.includes("STJ")) value += 10;
            else if (mbti.includes("STP")) value += 7;
            else if (mbti.includes("NTJ")) value += 7;
            else value += 4;
            break;
          case "harmony":
            if (mbti.includes("FJ")) value += 9;
            else if (mbti.includes("SF")) value += 8;
            else if (mbti.includes("NF")) value += 7;
            else value += 3;
            break;
          case "detail":
            if (mbti.includes("IS")) value += 9;
            else if (mbti.includes("ES")) value += 7;
            else if (mbti.includes("IN")) value += 5;
            else value += 3;
            break;
        }
      });
      
      // 平均値を計算し、10を最大値として正規化
      return Math.min(10, value / members.length);
    };
    
    // 各軸のチーム平均値を計算
    return axes.map(axis => ({
      axis: axis.axis,
      value: calculateMbtiAxisValue(selectedMembers, axis.key)
    }));
  };
  
  // チーム統合指数を計算（メンバー間の相性と補完性）
  const getTeamCohesionScore = () => {
    if (selectedMembers.length < 2) return 0;
    
    // メンバー間の相性を評価
    let compatibilitySum = 0;
    let compatibilityCount = 0;
    
    for (let i = 0; i < selectedMembers.length; i++) {
      for (let j = i + 1; j < selectedMembers.length; j++) {
        const compatibility = getCompatibility(
          selectedMembers[i].mbtiType, 
          selectedMembers[j].mbtiType
        );
        
        // 相性スコアに変換
        let compatibilityScore = 0;
        if (compatibility === "良好") compatibilityScore = 100;
        else if (compatibility === "普通") compatibilityScore = 60;
        else if (compatibility === "要注意") compatibilityScore = 30;
        
        compatibilitySum += compatibilityScore;
        compatibilityCount++;
      }
    }
    
    // 平均相性スコア
    const avgCompatibility = compatibilityCount > 0 ? 
      compatibilitySum / compatibilityCount : 0;
    
    return Math.round(avgCompatibility);
  };
  
  // チーム多様性指数を計算
  const getTeamDiversityScore = () => {
    if (selectedMembers.length === 0) return 0;
    
    // MBTI タイプの多様性（ユニークなタイプの数）
    const uniqueTypes = new Set(selectedMembers.map(m => m.mbtiType));
    const typesDiversity = (uniqueTypes.size / selectedMembers.length) * 100;
    
    // スキルの多様性
    const allSkills = new Set<string>();
    selectedMembers.forEach(member => {
      if (member.skills && Array.isArray(member.skills)) {
        member.skills.forEach(skill => allSkills.add(skill));
      }
    });
    
    // 平均スキル数と多様性の関係
    const avgSkillsPerMember = allSkills.size / selectedMembers.length;
    const skillsDiversity = Math.min(100, avgSkillsPerMember * 20); // 5 or more skills = 100%
    
    // 総合多様性スコア（MBTI多様性とスキル多様性の平均）
    return Math.round((typesDiversity + skillsDiversity) / 2);
  };
  
  // スキル一覧をクリア
  const clearSelectedSkills = () => {
    setSelectedSkills([]);
  };
  
  // スキルが選択されているか確認
  const isSkillSelected = (skill: string) => {
    return selectedSkills.includes(skill);
  };
  
  // 選択されたスキルをメンバーに設定
  useEffect(() => {
    setNewMember(prev => ({
      ...prev,
      skills: selectedSkills
    }));
  }, [selectedSkills]);
  
  const handleAddNewMember = () => {
    const newId = Math.max(...teamMembers.map(m => m.id), 0) + 1;
    const member: TeamMember = {
      id: newId,
      username: newMember.name,
      mbtiType: newMember.mbtiType,
      selected: true,
      role: newMember.role,
      skills: newMember.skills
    };
    
    setTeamMembers(prev => [...prev, member]);
    setShowAddMemberDialog(false);
    setNewMember({
      name: "",
      mbtiType: "",
      role: "",
      skills: []
    });
    setSelectedSkills([]);
    
    toast({
      title: "メンバーが追加されました",
      description: `${newMember.name}がチームに追加されました。`,
    });
  };
  
  const handleAnalyzeTeam = () => {
    if (teamMembers.filter(m => m.selected).length < 2) {
      toast({
        title: "メンバーを選択してください",
        description: "分析には少なくとも2人のメンバーを選択する必要があります。",
        variant: "destructive"
      });
      return;
    }
    
    setActiveTab("analysis");
    
    toast({
      title: "チーム分析が完了しました",
      description: "選択されたメンバーの相性分析が表示されます。",
    });
  };
  
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
  
  const getMbtiTypeColorClass = (mbtiType?: string) => {
    if (!mbtiType) return "bg-gray-100 text-gray-800";
    
    const firstLetter = mbtiType[0];
    switch (firstLetter) {
      case "I":
        return "bg-blue-100 text-blue-800";
      case "E":
        return "bg-green-100 text-green-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };
  
  // MBTIタイプに基づいた役割を自動割り当て
  const assignRoleByMbtiType = (mbtiType: string): string => {
    if (!mbtiType) return "メンバー";
    
    const firstLetter = mbtiType[0];
    const lastLetter = mbtiType[3];
    
    if (firstLetter === "E" && lastLetter === "J") return "リーダー";
    if (firstLetter === "I" && mbtiType[1] === "N" && mbtiType[2] === "T") return "アナリスト";
    if (firstLetter === "E" && mbtiType[2] === "F") return "コミュニケーター";
    if (mbtiType[1] === "S" && lastLetter === "J") return "オーガナイザー";
    if (mbtiType[1] === "N" && lastLetter === "P") return "イノベーター";
    
    return "メンバー";
  };
  
  // ロールに合わせたバッジカラーを取得
  const getRoleBadgeClass = (role: string): string => {
    switch (role) {
      case "リーダー":
      case "プロジェクトマネージャー":
        return "bg-blue-100 text-blue-800";
      case "アナリスト":
      case "システムアナリスト":
        return "bg-green-100 text-green-800";
      case "コミュニケーター":
      case "マーケティングディレクター":
        return "bg-purple-100 text-purple-800";
      case "オーガナイザー":
        return "bg-orange-100 text-orange-800";
      case "イノベーター":
      case "デザイナー":
        return "bg-pink-100 text-pink-800";
      case "エンジニア":
      case "開発者":
      case "テスター":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // MBTIタイプの分布を計算
  const calculateMbtiDistribution = () => {
    const selectedMembers = teamMembers.filter(member => member.selected);
    
    // Eか I かの数
    const eCount = selectedMembers.filter(member => member.mbtiType.startsWith("E")).length;
    const iCount = selectedMembers.filter(member => member.mbtiType.startsWith("I")).length;
    
    // Sか N かの数
    const sCount = selectedMembers.filter(member => member.mbtiType[1] === "S").length;
    const nCount = selectedMembers.filter(member => member.mbtiType[1] === "N").length;
    
    // Tか F かの数
    const tCount = selectedMembers.filter(member => member.mbtiType[2] === "T").length;
    const fCount = selectedMembers.filter(member => member.mbtiType[2] === "F").length;
    
    // Jか P かの数
    const jCount = selectedMembers.filter(member => member.mbtiType[3] === "J").length;
    const pCount = selectedMembers.filter(member => member.mbtiType[3] === "P").length;
    
    return {
      eVsI: { E: eCount, I: iCount },
      sVsN: { S: sCount, N: nCount },
      tVsF: { T: tCount, F: fCount },
      jVsP: { J: jCount, P: pCount }
    };
  };
  
  const selectedMembers = teamMembers.filter(member => member.selected);
  const mbtiDistribution = calculateMbtiDistribution();
  
  // チームの強みを判断
  const getTeamStrengths = () => {
    const strengths = [];
    
    if (selectedMembers.some(m => m.mbtiType.includes('ENT'))) {
      strengths.push({ 
        id: 'leadership', 
        text: 'リーダーシップとビジョン設定の能力（ENTJ/ENTP）',
        detail: 'チームを率いて大局的な方向性を示し、戦略的な目標設定ができます。意思決定が早く、プロジェクト推進力が高いです。'
      });
    }
    
    if (selectedMembers.some(m => m.mbtiType.includes('INT'))) {
      strengths.push({ 
        id: 'analysis', 
        text: '論理的分析と問題解決能力（INTJ/INTP）',
        detail: '複雑な問題を論理的に分析し、独創的な解決策を見出すことができます。長期的な視点を持ち、効率的なシステム構築に優れています。'
      });
    }
    
    if (selectedMembers.some(m => m.mbtiType.includes('NFJ'))) {
      strengths.push({ 
        id: 'harmony', 
        text: 'チームの調和を保つ能力（ENFJ/INFJ）',
        detail: 'メンバー間の関係性を重視し、調和のとれたコミュニケーションを促進します。チームの意欲を高め、個々の強みを引き出すことに長けています。'
      });
    }
    
    if (selectedMembers.some(m => m.mbtiType.includes('STJ'))) {
      strengths.push({ 
        id: 'execution', 
        text: '実務的で組織的な実行力（ESTJ/ISTJ）',
        detail: '綿密な計画立案と正確な実行を得意とします。責任感が強く、期限や品質基準を厳守することでプロジェクトの安定性を確保します。'
      });
    }
    
    if (selectedMembers.some(m => m.mbtiType.includes('NFP'))) {
      strengths.push({ 
        id: 'creativity', 
        text: '創造性と柔軟な発想（ENFP/INFP）',
        detail: '独創的な発想と可能性を追求する姿勢があります。人間中心の視点で問題に取り組み、革新的なアイデアを生み出す力があります。'
      });
    }
    
    if (selectedMembers.some(m => m.mbtiType.includes('SFJ'))) {
      strengths.push({ 
        id: 'support', 
        text: '細やかなサポートとチームケア（ESFJ/ISFJ）',
        detail: 'メンバーのニーズに敏感に反応し、協力的な環境づくりに貢献します。詳細に気を配り、チーム内の人間関係や実務面での支援が得意です。'
      });
    }
    
    return strengths;
  };
  
  // チームの課題を判断
  const getTeamChallenges = () => {
    const challenges = [];
    
    if (mbtiDistribution.tVsF.T > mbtiDistribution.tVsF.F * 2 && mbtiDistribution.tVsF.T >= 2) {
      challenges.push({ 
        id: 'emotional_intelligence', 
        text: '感情面への配慮が不足する可能性（T型が多い）',
        detail: '論理や効率を重視するあまり、チーム内の感情的な側面や人間関係の重要性を見落とす可能性があります。決断が冷淡に映ることもあるでしょう。',
        solution: '意識的に感情面への配慮を行い、重要な決定の際には全員の意見や感情を考慮するプロセスを設けましょう。'
      });
    }
    
    if (mbtiDistribution.tVsF.F > mbtiDistribution.tVsF.T * 2 && mbtiDistribution.tVsF.F >= 2) {
      challenges.push({ 
        id: 'objective_decision', 
        text: '客観的な判断が難しい場合がある（F型が多い）',
        detail: '人間関係や調和を重視するあまり、困難な決断や客観的評価が必要な場面で躊躇することがあります。批判的なフィードバックがチーム内で不足する可能性があります。',
        solution: '客観的な評価基準を事前に設定し、データに基づいた意思決定の仕組みを取り入れましょう。'
      });
    }
    
    if (mbtiDistribution.jVsP.J > mbtiDistribution.jVsP.P * 2 && mbtiDistribution.jVsP.J >= 2) {
      challenges.push({ 
        id: 'flexibility', 
        text: '柔軟性に欠ける可能性がある（J型が多い）',
        detail: '計画通りに物事を進めることを好むため、状況変化への対応が遅れることがあります。新しいアイデアや方法に対して抵抗を示すことがあります。',
        solution: '定期的に計画や方法を見直す時間を設け、変化に対応するための余裕を計画に組み込みましょう。'
      });
    }
    
    if (mbtiDistribution.jVsP.P > mbtiDistribution.jVsP.J * 2 && mbtiDistribution.jVsP.P >= 2) {
      challenges.push({ 
        id: 'deadline', 
        text: '締め切りや計画の遵守が難しい場合がある（P型が多い）',
        detail: '柔軟性を重視するあまり、締め切りの厳守や計画的な進行が難しくなることがあります。最終決定を先延ばしにする傾向があります。',
        solution: '明確なマイルストーンと中間チェックポイントを設定し、進捗を可視化する仕組みを導入しましょう。'
      });
    }
    
    if (mbtiDistribution.eVsI.I > mbtiDistribution.eVsI.E * 2 && mbtiDistribution.eVsI.I >= 2) {
      challenges.push({ 
        id: 'communication', 
        text: '活発なコミュニケーションが不足する可能性（I型が多い）',
        detail: '内省的なメンバーが多いため、自発的な情報共有やディスカッションが不足しがちです。意見や懸念が表明されないまま進行することがあります。',
        solution: '定期的な1対1のミーティングやオンラインでの非同期コミュニケーションの仕組みを取り入れましょう。'
      });
    }
    
    if (mbtiDistribution.eVsI.E > mbtiDistribution.eVsI.I * 2 && mbtiDistribution.eVsI.E >= 2) {
      challenges.push({ 
        id: 'depth', 
        text: '深い思考や集中作業の時間が確保しにくい（E型が多い）',
        detail: '対話や議論が活発な一方で、個人の集中作業や内省の時間が十分に確保されないことがあります。また、意思決定が性急になる可能性があります。',
        solution: '「ディープワーク」の時間を明示的にスケジュールに組み込み、集中作業の環境を整えましょう。'
      });
    }
    
    if (mbtiDistribution.sVsN.S > mbtiDistribution.sVsN.N * 2 && mbtiDistribution.sVsN.S >= 2) {
      challenges.push({ 
        id: 'innovation', 
        text: '革新的なアイデアや長期的なビジョンが不足する可能性（S型が多い）',
        detail: '現実的で実践的なアプローチを好むあまり、革新的な発想や将来を見据えた計画が不足する可能性があります。',
        solution: 'ブレインストーミングやアイデア創出のセッションを定期的に設け、「もし〜だったら」という仮説思考を促しましょう。'
      });
    }
    
    if (mbtiDistribution.sVsN.N > mbtiDistribution.sVsN.S * 2 && mbtiDistribution.sVsN.N >= 2) {
      challenges.push({ 
        id: 'practicality', 
        text: '実務的な詳細への注意が不足する可能性（N型が多い）',
        detail: '大局的なビジョンや可能性を追求するあまり、実装の詳細や現実的な制約への配慮が不足しがちです。',
        solution: '実行計画に具体的なチェックリストを含め、詳細な品質基準や要件を明文化しましょう。'
      });
    }
    
    return challenges;
  };
  
  // メンバースキルの分布を計算
  const calculateSkillDistribution = () => {
    const selectedMembers = teamMembers.filter(member => member.selected);
    const skillsCount: Record<string, number> = {};
    
    // 各スキルの出現回数をカウント
    selectedMembers.forEach(member => {
      if (member.skills && Array.isArray(member.skills)) {
        member.skills.forEach(skill => {
          if (skillsCount[skill]) {
            skillsCount[skill]++;
          } else {
            skillsCount[skill] = 1;
          }
        });
      }
    });
    
    // チャート用にデータを整形
    const data = Object.entries(skillsCount)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: Math.round((count / selectedMembers.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);
    
    return data;
  };
  
  // メンバーのスキルに基づいた強みを分析
  const getSkillsBasedStrengths = () => {
    const skillDistribution = calculateSkillDistribution();
    const strengths = [];
    
    // 技術的なスキルが多いか確認
    const technicalSkills = ['プログラミング', '技術開発', '分析', '問題解決'];
    const hasTechnicalFocus = technicalSkills.some(skill => 
      skillDistribution.some(item => item.skill === skill && item.percentage >= 50)
    );
    
    if (hasTechnicalFocus) {
      strengths.push({
        id: 'technical',
        text: '技術力と問題解決能力',
        detail: 'チームは複雑な技術的課題に取り組む能力があります。問題解決能力と分析力を活かした難題への対応が期待できます。'
      });
    }
    
    // コミュニケーション系スキルが多いか確認
    const communicationSkills = ['コミュニケーション', 'チームビルディング', '交渉', '調査'];
    const hasCommunicationFocus = communicationSkills.some(skill => 
      skillDistribution.some(item => item.skill === skill && item.percentage >= 50)
    );
    
    if (hasCommunicationFocus) {
      strengths.push({
        id: 'communication',
        text: 'コミュニケーションとチーム構築能力',
        detail: 'チームは優れたコミュニケーション能力を持ち、メンバー間の連携やステークホルダーとの関係構築に長けています。'
      });
    }
    
    // 創造性や革新性のスキルが多いか確認
    const creativeSkills = ['創造性', 'デザイン', 'イノベーション'];
    const hasCreativeFocus = creativeSkills.some(skill => 
      skillDistribution.some(item => item.skill === skill && item.percentage >= 30)
    );
    
    if (hasCreativeFocus) {
      strengths.push({
        id: 'creativity',
        text: '創造性と革新的思考',
        detail: 'チームは新しいアイデアを生み出し、従来の枠にとらわれない革新的なアプローチを取ることができます。'
      });
    }
    
    // マネジメント系スキルが多いか確認
    const managementSkills = ['プロジェクト管理', 'リーダーシップ', '計画立案', '組織化'];
    const hasManagementFocus = managementSkills.some(skill => 
      skillDistribution.some(item => item.skill === skill && item.percentage >= 40)
    );
    
    if (hasManagementFocus) {
      strengths.push({
        id: 'management',
        text: 'プロジェクト管理と組織力',
        detail: 'チームはプロジェクトを効率的に進める能力と、組織的に物事を遂行する力があります。計画性と実行力を併せ持っています。'
      });
    }
    
    return strengths;
  };
  
  // レーダーチャート用データの準備
  const prepareRadarData = (member: TeamMember) => {
    // スキルカテゴリーとレーティング
    const categories = {
      'プログラミング': 0,
      'プロジェクト管理': 0,
      'コミュニケーション': 0,
      '分析': 0,
      '創造性': 0,
      'リーダーシップ': 0,
    };
    
    // スキルとカテゴリーのマッピング
    const skillCategoryMap: Record<string, keyof typeof categories> = {
      'プログラミング': 'プログラミング',
      '技術開発': 'プログラミング',
      'プロジェクト管理': 'プロジェクト管理',
      '計画立案': 'プロジェクト管理',
      '組織化': 'プロジェクト管理',
      'コミュニケーション': 'コミュニケーション',
      'チームビルディング': 'コミュニケーション',
      '交渉': 'コミュニケーション',
      '分析': '分析',
      '問題解決': '分析',
      '調査': '分析',
      '構造化思考': '分析',
      '創造性': '創造性',
      'デザイン': '創造性',
      'イノベーション': '創造性',
      'リーダーシップ': 'リーダーシップ',
    };
    
    // MBTIタイプに基づいた基本値の設定
    if (member.mbtiType) {
      const firstLetter = member.mbtiType[0];
      const secondLetter = member.mbtiType[1];
      const thirdLetter = member.mbtiType[2];
      const fourthLetter = member.mbtiType[3];
      
      // E/Iの特性
      if (firstLetter === 'E') {
        categories['コミュニケーション'] += 3;
        categories['リーダーシップ'] += 2;
      } else {
        categories['分析'] += 2;
        categories['プログラミング'] += 1;
      }
      
      // S/Nの特性
      if (secondLetter === 'S') {
        categories['プロジェクト管理'] += 3;
        categories['プログラミング'] += 1;
      } else {
        categories['創造性'] += 3;
        categories['分析'] += 1;
      }
      
      // T/Fの特性
      if (thirdLetter === 'T') {
        categories['分析'] += 3;
        categories['プログラミング'] += 2;
      } else {
        categories['コミュニケーション'] += 3;
        categories['創造性'] += 1;
      }
      
      // J/Pの特性
      if (fourthLetter === 'J') {
        categories['プロジェクト管理'] += 3;
        categories['リーダーシップ'] += 1;
      } else {
        categories['創造性'] += 2;
        categories['コミュニケーション'] += 1;
      }
    }
    
    // 役割に基づいた追加ポイント
    if (member.role) {
      switch (member.role) {
        case 'リーダー':
        case 'プロジェクトマネージャー':
          categories['リーダーシップ'] += 3;
          categories['プロジェクト管理'] += 2;
          break;
        case 'エンジニア':
        case '開発者':
        case 'テスター':
          categories['プログラミング'] += 3;
          categories['分析'] += 2;
          break;
        case 'アナリスト':
        case 'システムアナリスト':
          categories['分析'] += 3;
          categories['プログラミング'] += 1;
          break;
        case 'デザイナー':
          categories['創造性'] += 3;
          break;
        case 'コミュニケーター':
        case 'マーケティングディレクター':
          categories['コミュニケーション'] += 3;
          categories['創造性'] += 1;
          break;
      }
    }
    
    // メンバーのスキルに基づいたポイントを追加
    if (member.skills && Array.isArray(member.skills)) {
      member.skills.forEach(skill => {
        const category = skillCategoryMap[skill];
        if (category && categories[category] !== undefined) {
          categories[category] += 2;
        }
      });
    }
    
    // 最大値を10に制限
    Object.keys(categories).forEach(key => {
      const typedKey = key as keyof typeof categories;
      if (categories[typedKey] > 10) {
        categories[typedKey] = 10;
      }
    });
    
    // レーダーチャート用にデータを整形
    return Object.entries(categories).map(([category, value]) => ({
      category,
      value,
      fullMark: 10
    }));
  };
  
  // チームスキル分布データの準備
  const prepareTeamSkillsData = () => {
    const skillDistribution = calculateSkillDistribution();
    return skillDistribution.slice(0, 8); // 上位8つのスキルを表示
  };
  
  const teamStrengths = getTeamStrengths();
  const teamChallenges = getTeamChallenges();
  const skillsBasedStrengths = getSkillsBasedStrengths();
  
  return (
    <section className="py-4">
      <div className="w-full">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold gradient-text text-center mb-8">
            エンジニアチーム分析 <span className="text-sm font-medium text-muted-foreground ml-2">Powered by MBTI</span>
          </h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="setup" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                チームメンバー
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M3 3v18h18"></path>
                  <path d="M18 17V9"></path>
                  <path d="M13 17V5"></path>
                  <path d="M8 17v-3"></path>
                </svg>
                チーム分析
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup" className="mt-6">
              {/* Team Members Selection */}
              <Card className="shadow-md rounded-lg p-6 border-border/60">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium gradient-text flex items-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    チームメンバー選択
                  </h3>
                  <Button 
                    onClick={() => setShowAddMemberDialog(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M12 5v14M5 12h14"></path>
                    </svg>
                    メンバー追加
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MBTIタイプ</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スキル</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">役割</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">選択</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teamMembers.map((member) => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                  {getUserInitials(member.username)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{member.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {member.mbtiType ? (
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMbtiTypeColorClass(member.mbtiType)}`}>
                                {member.mbtiType}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">未設定</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.skills || "未設定"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.role || "未設定"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Checkbox 
                              checked={member.selected}
                              onCheckedChange={(checked) => handleMemberSelection(member.id, checked as boolean)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              削除
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button 
                    onClick={handleAnalyzeTeam} 
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-lg py-6 px-8 text-base font-medium"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M3 3v18h18"></path>
                      <path d="M18 17V9"></path>
                      <path d="M13 17V5"></path>
                      <path d="M8 17v-3"></path>
                    </svg>
                    チームを分析する
                  </Button>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="analysis" className="mt-6">
              {/* Team Composition Overview */}
              <Card className="shadow-md rounded-lg p-6 mb-8">
                <h3 className="text-lg font-medium gradient-text mb-4">チーム構成概要</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Team Members */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">チームメンバー</h4>
                    <ul className="space-y-3">
                      {selectedMembers.map((member) => {
                        const suggestedRole = member.role || assignRoleByMbtiType(member.mbtiType);
                        const roleClass = getRoleBadgeClass(suggestedRole);
                        
                        return (
                          <li key={member.id} className="flex items-center">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                                {getUserInitials(member.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{member.username}</p>
                              <p className="text-xs text-gray-500">{member.mbtiType}</p>
                            </div>
                            <span className={`ml-auto px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleClass}`}>
                              {suggestedRole}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  
                  {/* MBTI Distribution */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">MBTI分布</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-1">外向型 vs 内向型 (E vs I)</p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{width: `${(mbtiDistribution.eVsI.E / (mbtiDistribution.eVsI.E + mbtiDistribution.eVsI.I) * 100) || 0}%`}}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>E: {mbtiDistribution.eVsI.E}</span>
                            <span>I: {mbtiDistribution.eVsI.I}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">感覚型 vs 直感型 (S vs N)</p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{width: `${(mbtiDistribution.sVsN.S / (mbtiDistribution.sVsN.S + mbtiDistribution.sVsN.N) * 100) || 0}%`}}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>S: {mbtiDistribution.sVsN.S}</span>
                            <span>N: {mbtiDistribution.sVsN.N}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">思考型 vs 感情型 (T vs F)</p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-purple-600 h-2.5 rounded-full" 
                              style={{width: `${(mbtiDistribution.tVsF.T / (mbtiDistribution.tVsF.T + mbtiDistribution.tVsF.F) * 100) || 0}%`}}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>T: {mbtiDistribution.tVsF.T}</span>
                            <span>F: {mbtiDistribution.tVsF.F}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">判断型 vs 知覚型 (J vs P)</p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-orange-600 h-2.5 rounded-full" 
                              style={{width: `${(mbtiDistribution.jVsP.J / (mbtiDistribution.jVsP.J + mbtiDistribution.jVsP.P) * 100) || 0}%`}}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>J: {mbtiDistribution.jVsP.J}</span>
                            <span>P: {mbtiDistribution.jVsP.P}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Team Compatibility Matrix */}
              <Card className="shadow-md rounded-lg p-6 mb-8">
                <h3 className="text-lg font-medium gradient-text mb-4">チーム相性マトリックス</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="w-36"></th>
                        {selectedMembers.map((member) => (
                          <th key={member.id} className="px-4 py-2 text-center text-sm">
                            {member.username.split(' ')[0]} ({member.mbtiType})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMembers.map((row) => (
                        <tr key={row.id}>
                          <td className="px-4 py-2 font-medium text-sm">
                            {row.username.split(' ')[0]} ({row.mbtiType})
                          </td>
                          {selectedMembers.map((col) => {
                            // 自分自身との相性は表示しない
                            if (row.id === col.id) {
                              return (
                                <td key={col.id} className="px-4 py-2 text-center bg-gray-100">
                                  -
                                </td>
                              );
                            }
                            
                            const compatibility = getCompatibility(row.mbtiType, col.mbtiType);
                            const colorClass = getCompatibilityColorClass(compatibility);
                            
                            return (
                              <td key={col.id} className={`px-4 py-2 text-center ${colorClass}`}>
                                <span className="font-medium">{compatibility}</span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              
              {/* Team Strengths and Challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Strengths */}
                <Card className="shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-medium gradient-text-accent mb-4 flex items-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-600">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    チームの強み
                  </h3>
                  {teamStrengths.length > 0 ? (
                    <ul className="space-y-4">
                      {teamStrengths.map((strength) => (
                        <li key={strength.id} className="bg-green-50 p-3 rounded-lg">
                          <div className="flex mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700 font-medium">{strength.text}</span>
                          </div>
                          <p className="text-sm text-gray-600 ml-7">{strength.detail}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">チームメンバーが不足しているため、強みを分析できません。</p>
                  )}
                </Card>
                
                {/* Challenges */}
                <Card className="shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-medium gradient-text-accent mb-4 flex items-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-red-500">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    チームの課題
                  </h3>
                  {teamChallenges.length > 0 ? (
                    <ul className="space-y-4">
                      {teamChallenges.map((challenge) => (
                        <li key={challenge.id} className="bg-red-50 p-3 rounded-lg">
                          <div className="flex mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700 font-medium">{challenge.text}</span>
                          </div>
                          <p className="text-sm text-gray-600 ml-7 mb-2">{challenge.detail}</p>
                          <div className="bg-white p-2 rounded border border-red-100 ml-7">
                            <p className="text-sm text-gray-600 font-medium">解決策: </p>
                            <p className="text-sm text-gray-600">{challenge.solution}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">現在のチーム構成では特に大きな課題は見つかりませんでした。</p>
                  )}
                </Card>
              </div>
              
              {/* エンジニアリングコンテキスト特化の分析 */}
              <div className="mt-12 mb-8">
                <Card className="shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-medium gradient-text mb-4 flex items-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-600">
                      <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                      <path d="M2 2l7.586 7.586"></path>
                      <circle cx="11" cy="11" r="2"></circle>
                    </svg>
                    開発フェーズ別適性分析
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    チームメンバーのMBTIタイプとスキルを分析し、各開発フェーズにおける強みと課題を評価しています。各フェーズに対する適性度を確認できます。
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    {DEVELOPMENT_PHASES.map((phase) => {
                      // このフェーズに適したMBTIタイプを持つメンバーの数をカウント
                      const suitableMembers = selectedMembers.filter(member => 
                        phase.recommendedMbtiTypes.includes(member.mbtiType)
                      );
                      
                      // 適性度を計算 (0-100%)
                      const suitabilityPercentage = Math.min(
                        100, 
                        Math.round((suitableMembers.length / selectedMembers.length) * 100)
                      );
                      
                      // 適性度に応じたカラークラスを決定
                      let colorClass = "bg-red-100 border-red-300";
                      if (suitabilityPercentage >= 70) {
                        colorClass = "bg-green-100 border-green-300";
                      } else if (suitabilityPercentage >= 40) {
                        colorClass = "bg-yellow-100 border-yellow-300";
                      }
                      
                      return (
                        <div key={phase.id} className={`border rounded-lg p-4 ${colorClass}`}>
                          <h4 className="text-sm font-semibold mb-2">{phase.name}</h4>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div 
                              className={`h-2 rounded-full ${suitabilityPercentage >= 70 ? 'bg-green-600' : suitabilityPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${suitabilityPercentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs">{suitabilityPercentage}% 適合</p>
                          
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-1">推奨スキル:</p>
                            <div className="flex flex-wrap gap-1">
                              {phase.keySkills.slice(0, 3).map((skill, index) => (
                                <span key={index} className="text-xs px-2 py-0.5 bg-white/70 rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold mb-3">チームの強みフェーズ</h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      {selectedMembers.length > 0 ? (
                        <>
                          <p className="text-sm mb-2">
                            現在のチーム構成では
                            <span className="font-medium"> {getTeamStrengthPhase()} </span>
                            が最も強みを発揮できるフェーズです。
                          </p>
                          <p className="text-xs text-gray-600">
                            チームメンバーのMBTIタイプ分布とスキルセットから分析しています。特に重要な開発フェーズがある場合は、そのフェーズに適したメンバーを追加することを検討してください。
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">
                          チームメンバーが選択されていないため、分析できません。
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* プロジェクト種別に応じた推奨チーム構成 */}
              <div className="mb-8">
                <Card className="shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-medium gradient-text mb-4 flex items-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    プロジェクト適合性分析
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    現在のチーム構成が、異なるタイプのプロジェクトにどれだけ適しているかを評価しています。プロジェクトタイプごとの適合度と、最適なチーム構成のためのギャップを確認できます。
                  </p>
                  
                  <div className="space-y-8">
                    {PROJECT_TYPES.map((projectType) => {
                      // 現在のMBTI分布と理想的な分布のギャップを計算
                      const mbtiGap = calculateMbtiGap(mbtiDistribution, projectType.idealMbtiDistribution);
                      // スキルギャップを計算
                      const skillGap = calculateSkillGap(selectedMembers, projectType.keySkills);
                      // 総合適合度を計算 (0-100%)
                      const overallFitPercentage = Math.max(0, 100 - (mbtiGap * 0.6 + skillGap * 0.4));
                      
                      return (
                        <div key={projectType.id} className="border border-gray-200 rounded-lg p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-md font-medium">{projectType.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{projectType.description}</p>
                            </div>
                            <div className={`text-xl font-bold ${getProjectFitColorClass(overallFitPercentage)}`}>
                              {Math.round(overallFitPercentage)}%
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1">総合適合度</p>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full ${getProjectFitGradient(overallFitPercentage)}`} 
                                style={{ width: `${overallFitPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                            <div>
                              <h5 className="text-sm font-medium mb-3">推奨役割とスキル</h5>
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="mb-3">
                                  <p className="text-xs text-blue-800 mb-1">主要役割</p>
                                  <div className="flex flex-wrap gap-1">
                                    {projectType.recommendedRoles.map((role, idx) => (
                                      <span key={idx} className={`text-xs px-2 py-1 rounded-full ${
                                        hasRoleInTeam(role) ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {role} {hasRoleInTeam(role) && '✓'}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-blue-800 mb-1">必要スキル</p>
                                  <div className="flex flex-wrap gap-1">
                                    {projectType.keySkills.map((skill, idx) => (
                                      <span key={idx} className={`text-xs px-2 py-1 rounded-full ${
                                        hasSkillInTeam(skill) ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {skill} {hasSkillInTeam(skill) && '✓'}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium mb-3">MBTIタイプ適合性</h5>
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-xs text-purple-800 mb-1">E vs I</p>
                                    <div className="flex items-center">
                                      <div className="w-full h-2 bg-gray-200 rounded-full">
                                        <div className="bg-purple-500 h-2 rounded-full" 
                                          style={{ width: `${mbtiDistribution.eVsI.E / (mbtiDistribution.eVsI.E + mbtiDistribution.eVsI.I) * 100}%` }}></div>
                                      </div>
                                      <div className="ml-2 text-xs">
                                        {Math.round(mbtiDistribution.eVsI.E / (mbtiDistribution.eVsI.E + mbtiDistribution.eVsI.I) * 100 || 0)}%
                                      </div>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1">
                                      <span>E</span>
                                      <span>I</span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="text-xs text-purple-800 mb-1">S vs N</p>
                                    <div className="flex items-center">
                                      <div className="w-full h-2 bg-gray-200 rounded-full">
                                        <div className="bg-purple-500 h-2 rounded-full" 
                                          style={{ width: `${mbtiDistribution.sVsN.S / (mbtiDistribution.sVsN.S + mbtiDistribution.sVsN.N) * 100}%` }}></div>
                                      </div>
                                      <div className="ml-2 text-xs">
                                        {Math.round(mbtiDistribution.sVsN.S / (mbtiDistribution.sVsN.S + mbtiDistribution.sVsN.N) * 100 || 0)}%
                                      </div>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1">
                                      <span>S</span>
                                      <span>N</span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="text-xs text-purple-800 mb-1">T vs F</p>
                                    <div className="flex items-center">
                                      <div className="w-full h-2 bg-gray-200 rounded-full">
                                        <div className="bg-purple-500 h-2 rounded-full" 
                                          style={{ width: `${mbtiDistribution.tVsF.T / (mbtiDistribution.tVsF.T + mbtiDistribution.tVsF.F) * 100}%` }}></div>
                                      </div>
                                      <div className="ml-2 text-xs">
                                        {Math.round(mbtiDistribution.tVsF.T / (mbtiDistribution.tVsF.T + mbtiDistribution.tVsF.F) * 100 || 0)}%
                                      </div>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1">
                                      <span>T</span>
                                      <span>F</span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="text-xs text-purple-800 mb-1">J vs P</p>
                                    <div className="flex items-center">
                                      <div className="w-full h-2 bg-gray-200 rounded-full">
                                        <div className="bg-purple-500 h-2 rounded-full" 
                                          style={{ width: `${mbtiDistribution.jVsP.J / (mbtiDistribution.jVsP.J + mbtiDistribution.jVsP.P) * 100}%` }}></div>
                                      </div>
                                      <div className="ml-2 text-xs">
                                        {Math.round(mbtiDistribution.jVsP.J / (mbtiDistribution.jVsP.J + mbtiDistribution.jVsP.P) * 100 || 0)}%
                                      </div>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1">
                                      <span>J</span>
                                      <span>P</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-5">
                            <h5 className="text-sm font-medium mb-2">ギャップ分析</h5>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              {getBestRecommendation(projectType)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
              
              {/* チーム関係性の視覚化 */}
              <div className="mb-8">
                <Card className="shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-medium gradient-text mb-4 flex items-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-600">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    チーム構成可視化
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    チームメンバー間の相性と相互関係を視覚的に表現しています。チーム全体の強みと弱みの分布が一目でわかります。
                  </p>
                  
                  <div className="h-80 w-full">
                    {selectedMembers.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getTeamRadarData()}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="axis" />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} />
                          <Radar
                            name="チーム平均"
                            dataKey="value"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.6}
                          />
                          <Tooltip />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">チームメンバーが選択されていないため、表示できません</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold mb-3 text-blue-800">チーム統合指数</h4>
                      <div className="flex items-center mb-3">
                        <div className="w-full h-3 bg-gray-200 rounded-full mr-4">
                          <div 
                            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" 
                            style={{ width: `${getTeamCohesionScore()}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold">{getTeamCohesionScore()}%</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        チームメンバー間のMBTI相性とスキル補完性から算出したチーム統合指数です。
                        数値が高いほど、チームとしての一体感や協力関係が構築しやすいことを示しています。
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold mb-3 text-green-800">チーム多様性指数</h4>
                      <div className="flex items-center mb-3">
                        <div className="w-full h-3 bg-gray-200 rounded-full mr-4">
                          <div 
                            className="h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500" 
                            style={{ width: `${getTeamDiversityScore()}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold">{getTeamDiversityScore()}%</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        チーム内のMBTIタイプやスキルの多様性から算出した指数です。
                        数値が高いほど、多角的な視点や幅広いスキルセットを持つチームであることを示しています。
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button 
                  onClick={() => setActiveTab("setup")}
                  variant="outline"
                  className="border-indigo-300 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400 text-indigo-700 shadow-sm text-sm py-5 px-6"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  チーム編成に戻る
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Add Member Dialog */}
          <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  新しいメンバーを追加
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">名前</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="mbti-type">MBTIタイプ</Label>
                  <Select
                    value={newMember.mbtiType}
                    onValueChange={(value) => setNewMember(prev => ({ ...prev, mbtiType: value }))}
                  >
                    <SelectTrigger id="mbti-type">
                      <SelectValue placeholder="MBTIタイプを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'].map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="role">役割</Label>
                  <Select
                    value={newMember.role}
                    onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="役割を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="skills">スキル・強み（複数選択可）</Label>
                  <div className="border p-3 rounded-md h-40 overflow-y-auto grid grid-cols-2 gap-2">
                    {SKILL_OPTIONS.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`skill-${skill}`} 
                          checked={isSkillSelected(skill)}
                          onCheckedChange={() => toggleSkill(skill)}
                        />
                        <label 
                          htmlFor={`skill-${skill}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {selectedSkills.length === 0 ? 'スキルが選択されていません' : `${selectedSkills.length}個のスキルが選択されました`}
                    </span>
                    {selectedSkills.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearSelectedSkills}
                      >
                        クリア
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleAddNewMember} 
                  disabled={!newMember.name || !newMember.mbtiType}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                  メンバーを追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}