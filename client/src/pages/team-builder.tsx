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
    setActiveTab("analysis");
  };
  
  // MBTIタイプに基づいて役割を提案する関数
  const assignRoleByMbtiType = (mbtiType: string): string => {
    // MBTIタイプに基づいて推奨役割を返す
    if (!mbtiType) return "メンバー";
    
    if (mbtiType.includes("ENT")) return "リーダー";
    if (mbtiType.includes("EST")) return "マネージャー";
    if (mbtiType.includes("INJ")) return "アナリスト";
    if (mbtiType.includes("ENF")) return "コミュニケーター";
    if (mbtiType.includes("IST")) return "テスター";
    if (mbtiType.includes("INT")) return "アーキテクト";
    if (mbtiType.includes("ISF")) return "サポート";
    if (mbtiType.includes("ESP")) return "イノベーター";
    if (mbtiType.includes("NFP")) return "デザイナー";
    if (mbtiType.includes("STP")) return "エンジニア";
    
    return "メンバー";
  };
  
  // 役割に応じたバッジのクラスを取得
  const getRoleBadgeClass = (role: string): string => {
    const roleToClassMap: Record<string, string> = {
      "リーダー": "bg-indigo-100 text-indigo-800",
      "プロジェクトマネージャー": "bg-blue-100 text-blue-800",
      "マネージャー": "bg-blue-100 text-blue-800",
      "アナリスト": "bg-purple-100 text-purple-800",
      "アーキテクト": "bg-purple-100 text-purple-800",
      "コミュニケーター": "bg-green-100 text-green-800",
      "デザイナー": "bg-pink-100 text-pink-800",
      "サポート": "bg-teal-100 text-teal-800",
      "テスター": "bg-orange-100 text-orange-800",
      "エンジニア": "bg-cyan-100 text-cyan-800",
      "開発者": "bg-cyan-100 text-cyan-800",
      "イノベーター": "bg-red-100 text-red-800"
    };
    
    return roleToClassMap[role] || "bg-gray-100 text-gray-800";
  };
  
  // MBTIタイプに応じた色クラスを取得
  const getMbtiTypeColorClass = (mbtiType: string): string => {
    if (mbtiType.startsWith("ENT")) return "bg-indigo-100 text-indigo-800";
    if (mbtiType.startsWith("INT")) return "bg-purple-100 text-purple-800";
    if (mbtiType.startsWith("EST")) return "bg-blue-100 text-blue-800";
    if (mbtiType.startsWith("IST")) return "bg-teal-100 text-teal-800";
    if (mbtiType.startsWith("ENF")) return "bg-green-100 text-green-800";
    if (mbtiType.startsWith("INF")) return "bg-emerald-100 text-emerald-800";
    if (mbtiType.startsWith("ESF")) return "bg-cyan-100 text-cyan-800";
    if (mbtiType.startsWith("ISF")) return "bg-sky-100 text-sky-800";
    if (mbtiType.startsWith("ENT")) return "bg-amber-100 text-amber-800";
    if (mbtiType.startsWith("INT")) return "bg-violet-100 text-violet-800";
    if (mbtiType.startsWith("EST")) return "bg-orange-100 text-orange-800";
    if (mbtiType.startsWith("IST")) return "bg-rose-100 text-rose-800";
    
    return "bg-gray-100 text-gray-800";
  };
  
  // ユーザーのイニシャルを取得
  const getUserInitials = (name: string): string => {
    if (!name) return "??";
    
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    
    return name.substring(0, 2).toUpperCase();
  };
  
  // 選択されたメンバーのみを取得
  const selectedMembers = teamMembers.filter(member => member.selected);
  
  // チームの強みと課題を取得
  const teamStrengths = React.useMemo(() => {
    if (selectedMembers.length === 0) return [];
    
    // MBTIタイプの集計
    const mbtiCounts = selectedMembers.reduce((acc, member) => {
      const type = member.mbtiType;
      if (type) {
        // E vs I
        if (type.startsWith("E")) acc.E++;
        else if (type.startsWith("I")) acc.I++;
        
        // S vs N
        if (type.includes("S")) acc.S++;
        else if (type.includes("N")) acc.N++;
        
        // T vs F
        if (type.includes("T")) acc.T++;
        else if (type.includes("F")) acc.F++;
        
        // J vs P
        if (type.includes("J")) acc.J++;
        else if (type.includes("P")) acc.P++;
      }
      return acc;
    }, { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    
    // チームの強みを分析
    const strengths = [];
    
    // Eが多い場合
    if (mbtiCounts.E > mbtiCounts.I && mbtiCounts.E > 1) {
      strengths.push({
        id: 1,
        text: "優れた外部コミュニケーション能力",
        detail: "外向型(E)メンバーが多く、外部との連携やコミュニケーションが得意なチームです。顧客対応や他チームとの協業がスムーズに進むでしょう。"
      });
    }
    
    // Iが多い場合
    if (mbtiCounts.I > mbtiCounts.E && mbtiCounts.I > 1) {
      strengths.push({
        id: 2,
        text: "深い思考と内省的アプローチ",
        detail: "内向型(I)メンバーが多く、じっくりと考え抜いた質の高い成果物を生み出せるチームです。複雑な問題の根本的な解決に強みがあります。"
      });
    }
    
    // Nが多い場合
    if (mbtiCounts.N > mbtiCounts.S && mbtiCounts.N > 1) {
      strengths.push({
        id: 3,
        text: "優れた創造性と革新性",
        detail: "直感型(N)メンバーが多く、新しいアイデアや未来の可能性を探るのが得意なチームです。イノベーションや長期的なビジョンの構築に強みがあります。"
      });
    }
    
    // Sが多い場合
    if (mbtiCounts.S > mbtiCounts.N && mbtiCounts.S > 1) {
      strengths.push({
        id: 4,
        text: "実用的で確実な実行力",
        detail: "感覚型(S)メンバーが多く、現実的かつ実用的なアプローチが得意なチームです。着実なプロジェクト進行と堅実な品質管理に強みがあります。"
      });
    }
    
    // Tが多い場合
    if (mbtiCounts.T > mbtiCounts.F && mbtiCounts.T > 1) {
      strengths.push({
        id: 5,
        text: "論理的で客観的な意思決定",
        detail: "思考型(T)メンバーが多く、論理的・客観的な分析と意思決定が得意なチームです。効率性や一貫性のある技術的判断に強みがあります。"
      });
    }
    
    // Fが多い場合
    if (mbtiCounts.F > mbtiCounts.T && mbtiCounts.F > 1) {
      strengths.push({
        id: 6,
        text: "人間中心の価値観と調和",
        detail: "感情型(F)メンバーが多く、チーム内の調和とユーザー視点を大切にできるチームです。人間関係の構築とユーザー体験の向上に強みがあります。"
      });
    }
    
    // Jが多い場合
    if (mbtiCounts.J > mbtiCounts.P && mbtiCounts.J > 1) {
      strengths.push({
        id: 7,
        text: "計画的で体系的な進行管理",
        detail: "判断型(J)メンバーが多く、計画に沿った体系的なプロジェクト管理が得意なチームです。納期厳守と着実な進捗に強みがあります。"
      });
    }
    
    // Pが多い場合
    if (mbtiCounts.P > mbtiCounts.J && mbtiCounts.P > 1) {
      strengths.push({
        id: 8,
        text: "柔軟性と適応力の高さ",
        detail: "知覚型(P)メンバーが多く、変化に柔軟に対応できるチームです。予期せぬ状況での臨機応変な対応や新しい情報の取り込みに強みがあります。"
      });
    }
    
    // 全体のバランスが良い場合
    if (Math.abs(mbtiCounts.E - mbtiCounts.I) <= 1 && 
        Math.abs(mbtiCounts.S - mbtiCounts.N) <= 1 && 
        Math.abs(mbtiCounts.T - mbtiCounts.F) <= 1 && 
        Math.abs(mbtiCounts.J - mbtiCounts.P) <= 1) {
      strengths.push({
        id: 9,
        text: "多様な視点とバランスの取れたアプローチ",
        detail: "MBTIタイプのバランスが取れており、多角的な視点からプロジェクトを進められるチームです。様々な側面をカバーできる総合力に強みがあります。"
      });
    }
    
    return strengths;
  }, [selectedMembers]);
  
  // チームの課題を取得
  const teamChallenges = React.useMemo(() => {
    if (selectedMembers.length === 0) return [];
    
    // MBTIタイプの集計
    const mbtiCounts = selectedMembers.reduce((acc, member) => {
      const type = member.mbtiType;
      if (type) {
        // E vs I
        if (type.startsWith("E")) acc.E++;
        else if (type.startsWith("I")) acc.I++;
        
        // S vs N
        if (type.includes("S")) acc.S++;
        else if (type.includes("N")) acc.N++;
        
        // T vs F
        if (type.includes("T")) acc.T++;
        else if (type.includes("F")) acc.F++;
        
        // J vs P
        if (type.includes("J")) acc.J++;
        else if (type.includes("P")) acc.P++;
      }
      return acc;
    }, { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    
    // チームの課題を分析
    const challenges = [];
    
    // Eがほとんどいない場合
    if (mbtiCounts.E === 0 && selectedMembers.length > 1) {
      challenges.push({
        id: 1,
        text: "外部コミュニケーションの不足",
        detail: "チーム内に外向型(E)のメンバーがおらず、外部との活発なコミュニケーションが難しい可能性があります。",
        solution: "ミーティングや報告書のフォーマットを標準化し、コミュニケーションの負担を減らしましょう。または一部のメンバーが意識的に外部連携役を担当することも有効です。"
      });
    }
    
    // Iがほとんどいない場合
    if (mbtiCounts.I === 0 && selectedMembers.length > 1) {
      challenges.push({
        id: 2,
        text: "深い考察と内省の不足",
        detail: "チーム内に内向型(I)のメンバーがおらず、深い思考や内省的な分析が不足する可能性があります。",
        solution: "重要な決定を下す前に「検討時間」を設け、各自が熟考できる時間を確保しましょう。オンラインでの非同期的なフィードバックの仕組みも効果的です。"
      });
    }
    
    // Nがほとんどいない場合
    if (mbtiCounts.N === 0 && selectedMembers.length > 1) {
      challenges.push({
        id: 3,
        text: "長期的視点と創造性の不足",
        detail: "チーム内に直感型(N)のメンバーがおらず、長期的な可能性や創造的なアイデアが不足する可能性があります。",
        solution: "定期的なブレインストーミングセッションを設け、自由な発想を促進しましょう。外部からの新しい視点や技術トレンドを定期的にインプットすることも大切です。"
      });
    }
    
    // Sがほとんどいない場合
    if (mbtiCounts.S === 0 && selectedMembers.length > 1) {
      challenges.push({
        id: 4,
        text: "現実的な実行力の不足",
        detail: "チーム内に感覚型(S)のメンバーがおらず、現実的な実装や細部への注意が不足する可能性があります。",
        solution: "詳細な実装計画とチェックリストを作成し、具体的なステップを明確にしましょう。定期的な進捗確認と実用性の検証プロセスを確立することが重要です。"
      });
    }
    
    // Fがほとんどいない場合
    if (mbtiCounts.F === 0 && selectedMembers.length > 1) {
      challenges.push({
        id: 5,
        text: "人間中心の視点の不足",
        detail: "チーム内に感情型(F)のメンバーがおらず、人間関係やユーザー感情への配慮が不足する可能性があります。",
        solution: "ユーザーペルソナを作成し、常に参照できるようにしましょう。定期的なユーザビリティテストやフィードバックセッションを実施し、ユーザー視点を取り入れることが大切です。"
      });
    }
    
    // Jがほとんどいない場合
    if (mbtiCounts.J === 0 && selectedMembers.length > 1) {
      challenges.push({
        id: 6,
        text: "構造化された計画性の不足",
        detail: "チーム内に判断型(J)のメンバーがおらず、計画的で体系的なプロジェクト管理が難しい可能性があります。",
        solution: "プロジェクト管理ツールを積極的に活用し、明確なマイルストーンと期限を設定しましょう。週次のスプリント計画と振り返りを習慣化することで計画性を高められます。"
      });
    }
    
    // Pがほとんどいない場合
    if (mbtiCounts.P === 0 && selectedMembers.length > 1) {
      challenges.push({
        id: 7,
        text: "柔軟性と適応力の不足",
        detail: "チーム内に知覚型(P)のメンバーがおらず、変化への柔軟な対応や新しい情報の取り込みが難しい可能性があります。",
        solution: "定期的に計画を見直し、変更に対応する時間を確保しましょう。アジャイル開発手法を取り入れ、小さな単位での反復と調整を繰り返すアプローチが効果的です。"
      });
    }
    
    // 極端な偏りがある場合
    if (mbtiCounts.T > 0 && mbtiCounts.F === 0 && mbtiCounts.T >= 3) {
      challenges.push({
        id: 8,
        text: "感情面への配慮不足",
        detail: "思考型(T)メンバーが多く、チーム内のコミュニケーションや意思決定において感情面への配慮が不足する可能性があります。",
        solution: "定期的なチームビルディング活動を実施し、メンバー間の信頼関係を構築しましょう。技術的な議論だけでなく、各自の意見や懸念を共有する時間を設けることも重要です。"
      });
    }
    
    if (mbtiCounts.F > 0 && mbtiCounts.T === 0 && mbtiCounts.F >= 3) {
      challenges.push({
        id: 9,
        text: "客観的な判断の不足",
        detail: "感情型(F)メンバーが多く、感情に配慮するあまり客観的な判断や効率性の追求が難しくなる可能性があります。",
        solution: "意思決定の際には、明確な評価基準と定量的なデータを用意しましょう。感情的な要素と論理的な要素の両方を考慮した構造化された意思決定プロセスを確立することが大切です。"
      });
    }
    
    return challenges;
  }, [selectedMembers]);
  
  // MBTI分布を計算する関数
  const calculateMbtiDistribution = () => {
    const distribution = {
      eVsI: { E: 0, I: 0 },
      sVsN: { S: 0, N: 0 },
      tVsF: { T: 0, F: 0 },
      jVsP: { J: 0, P: 0 }
    };
    
    selectedMembers.forEach(member => {
      const mbti = member.mbtiType;
      if (!mbti) return;
      
      // E vs I
      if (mbti.startsWith('E')) distribution.eVsI.E += 1;
      else if (mbti.startsWith('I')) distribution.eVsI.I += 1;
      
      // S vs N
      if (mbti[1] === 'S') distribution.sVsN.S += 1;
      else if (mbti[1] === 'N') distribution.sVsN.N += 1;
      
      // T vs F
      if (mbti[2] === 'T') distribution.tVsF.T += 1;
      else if (mbti[2] === 'F') distribution.tVsF.F += 1;
      
      // J vs P
      if (mbti[3] === 'J') distribution.jVsP.J += 1;
      else if (mbti[3] === 'P') distribution.jVsP.P += 1;
    });
    
    return distribution;
  };
  
  // 個人のレーダーチャートデータを作成
  const prepareRadarData = (member: TeamMember) => {
    const mbti = member.mbtiType;
    
    // 各MBTIタイプに基づいた特性評価（1-10のスケール）
    return [
      {
        subject: "分析力",
        A: mbti.includes("NT") ? 8 : mbti.includes("ST") ? 7 : mbti.includes("NF") ? 5 : 4
      },
      {
        subject: "創造性",
        A: mbti.includes("NP") ? 9 : mbti.includes("NF") ? 8 : mbti.includes("NT") ? 7 : 4
      },
      {
        subject: "リーダーシップ",
        A: mbti.includes("ETJ") ? 9 : mbti.includes("ENJ") ? 8 : mbti.includes("EST") ? 7 : 4
      },
      {
        subject: "実行力",
        A: mbti.includes("STJ") ? 10 : mbti.includes("NTJ") ? 8 : mbti.includes("STP") ? 7 : 5
      },
      {
        subject: "協調性",
        A: mbti.includes("FJ") ? 9 : mbti.includes("SF") ? 8 : mbti.includes("NF") ? 7 : 4
      },
      {
        subject: "細部への配慮",
        A: mbti.includes("IS") ? 9 : mbti.includes("ES") ? 7 : mbti.includes("IN") ? 5 : 4
      }
    ];
  };
  
  // MBTI分布の計算を実行
  const mbtiDistribution = calculateMbtiDistribution();
  
  // チーム能力のレーダーチャートデータ
  const teamRadarData = React.useMemo(() => {
    return getTeamRadarData();
  }, [selectedMembers]);
  
  // チーム統合指数と多様性指数
  const cohesionScore = React.useMemo(() => getTeamCohesionScore(), [selectedMembers]);
  const diversityScore = React.useMemo(() => getTeamDiversityScore(), [selectedMembers]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs 
        defaultValue="setup" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="setup" className="text-xs sm:text-sm">
            チーム設定
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-xs sm:text-sm">
            チーム分析
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="mt-6">
          {/* Team Members Selection */}
          <Card className="shadow-md rounded-lg p-3 sm:p-6 border-border/60">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
              <h3 className="text-base sm:text-lg font-medium gradient-text flex items-center">
                <svg width="16" height="16" className="sm:w-5 sm:h-5 mr-1 sm:mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                チームメンバー選択
              </h3>
              <Button 
                onClick={() => setShowAddMemberDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md text-xs sm:text-sm py-3 sm:py-2 px-3 sm:px-4"
              >
                <svg width="14" height="14" className="sm:w-4 sm:h-4 mr-1 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                メンバー追加
              </Button>
            </div>
            
            <div className="relative">
              <div className="sm:hidden absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
              <p className="text-[10px] text-gray-500 mb-1 sm:hidden">右にスワイプしてください →</p>
              <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-hide pb-1">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20">名前</th>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">MBTIタイプ</th>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">スキル</th>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">役割</th>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">選択</th>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 sm:h-10 sm:w-10">
                              <AvatarFallback className="bg-primary/10 text-primary font-medium text-[10px] sm:text-sm">
                                {getUserInitials(member.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-2 sm:ml-4">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">{member.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          {member.mbtiType ? (
                            <span className={`px-1 sm:px-2 inline-flex text-[10px] sm:text-xs leading-5 font-semibold rounded-full ${getMbtiTypeColorClass(member.mbtiType)}`}>
                              {member.mbtiType}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px] sm:text-xs">未設定</span>
                          )}
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-gray-500">
                          {member.skills || "未設定"}
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-gray-500">
                          {member.role || "未設定"}
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm font-medium">
                          <Checkbox 
                            checked={member.selected}
                            onCheckedChange={(checked) => handleMemberSelection(member.id, checked as boolean)}
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          />
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm font-medium">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                            className="text-red-600 hover:text-red-800 h-6 px-2 py-1 sm:h-8 sm:px-3 sm:py-1"
                          >
                            削除
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6 flex justify-center">
              <Button 
                onClick={handleAnalyzeTeam} 
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-lg py-3 sm:py-6 px-3 sm:px-8 text-xs sm:text-base font-medium"
              >
                <svg width="14" height="14" className="sm:w-5 sm:h-5 mr-1 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <Card className="shadow-md rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-medium gradient-text mb-3 sm:mb-4">チーム構成概要</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Team Members */}
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">チームメンバー</h4>
                <ul className="space-y-2 sm:space-y-3">
                  {selectedMembers.map((member) => {
                    const suggestedRole = member.role || assignRoleByMbtiType(member.mbtiType);
                    const roleClass = getRoleBadgeClass(suggestedRole);
                    
                    return (
                      <li key={member.id} className="flex items-center">
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium text-[10px] sm:text-sm">
                            {getUserInitials(member.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-2 sm:ml-3">
                          <p className="text-xs sm:text-sm font-medium text-gray-900">{member.username}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">{member.mbtiType}</p>
                        </div>
                        <span className={`ml-auto px-1.5 sm:px-2 inline-flex text-[10px] sm:text-xs leading-5 font-semibold rounded-full ${roleClass}`}>
                          {suggestedRole}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              {/* MBTI Distribution */}
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">MBTI分布</h4>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">外向型 vs 内向型 (E vs I)</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                        <div 
                          className="bg-blue-600 h-2 sm:h-2.5 rounded-full" 
                          style={{width: `${(mbtiDistribution.eVsI.E / (mbtiDistribution.eVsI.E + mbtiDistribution.eVsI.I) * 100) || 0}%`}}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
                        <span>E: {mbtiDistribution.eVsI.E}</span>
                        <span>I: {mbtiDistribution.eVsI.I}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">感覚型 vs 直感型 (S vs N)</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                        <div 
                          className="bg-green-600 h-2 sm:h-2.5 rounded-full" 
                          style={{width: `${(mbtiDistribution.sVsN.S / (mbtiDistribution.sVsN.S + mbtiDistribution.sVsN.N) * 100) || 0}%`}}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
                        <span>S: {mbtiDistribution.sVsN.S}</span>
                        <span>N: {mbtiDistribution.sVsN.N}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">思考型 vs 感情型 (T vs F)</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                        <div 
                          className="bg-purple-600 h-2 sm:h-2.5 rounded-full" 
                          style={{width: `${(mbtiDistribution.tVsF.T / (mbtiDistribution.tVsF.T + mbtiDistribution.tVsF.F) * 100) || 0}%`}}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
                        <span>T: {mbtiDistribution.tVsF.T}</span>
                        <span>F: {mbtiDistribution.tVsF.F}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">判断型 vs 知覚型 (J vs P)</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                        <div 
                          className="bg-orange-600 h-2 sm:h-2.5 rounded-full" 
                          style={{width: `${(mbtiDistribution.jVsP.J / (mbtiDistribution.jVsP.J + mbtiDistribution.jVsP.P) * 100) || 0}%`}}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
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
          <Card className="shadow-md rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-medium gradient-text mb-3 sm:mb-4">チーム相性マトリックス</h3>
            
            <div className="relative">
              <div className="sm:hidden absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
              <p className="text-[10px] text-gray-500 mb-1 sm:hidden">右にスワイプしてください →</p>
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide pb-1">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="w-20 sm:w-24 md:w-36 sticky left-0 bg-white z-20"></th>
                      {selectedMembers.map((member) => (
                        <th key={member.id} className="px-1 sm:px-2 md:px-4 py-1 md:py-2 text-center text-[10px] sm:text-xs md:text-sm">
                          {member.username.split(' ')[0]} ({member.mbtiType})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMembers.map((row) => (
                      <tr key={row.id}>
                        <td className="px-1 sm:px-2 md:px-4 py-1 md:py-2 font-medium text-[10px] sm:text-xs md:text-sm">
                          {row.username.split(' ')[0]} ({row.mbtiType})
                        </td>
                        {selectedMembers.map((col) => {
                          // 自分自身との相性は表示しない
                          if (row.id === col.id) {
                            return (
                              <td key={col.id} className="px-2 sm:px-3 md:px-4 py-1 md:py-2 text-center bg-gray-100">
                                -
                              </td>
                            );
                          }
                          
                          const compatibility = getCompatibility(row.mbtiType, col.mbtiType);
                          const colorClass = getCompatibilityColorClass(compatibility);
                          
                          return (
                            <td key={col.id} className={`px-2 sm:px-3 md:px-4 py-1 md:py-2 text-center ${colorClass}`}>
                              <span className="font-medium text-[10px] sm:text-xs md:text-sm">{compatibility}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
          
          {/* Team Strengths and Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {/* Strengths */}
            <Card className="shadow-md rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium gradient-text-accent mb-3 sm:mb-4 flex items-center">
                <svg width="16" height="16" className="sm:w-5 sm:h-5 mr-1 sm:mr-2 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                チームの強み
              </h3>
              {teamStrengths.length > 0 ? (
                <ul className="space-y-2 sm:space-y-4">
                  {teamStrengths.map((strength) => (
                    <li key={strength.id} className="bg-green-50 p-2 sm:p-3 rounded-lg">
                      <div className="flex mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 mr-1 sm:mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 font-medium text-xs sm:text-sm">{strength.text}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 ml-5 sm:ml-7">{strength.detail}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-xs sm:text-sm">チームメンバーが不足しているため、強みを分析できません。</p>
              )}
            </Card>
            
            {/* Challenges */}
            <Card className="shadow-md rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium gradient-text-accent mb-3 sm:mb-4 flex items-center">
                <svg width="16" height="16" className="sm:w-5 sm:h-5 mr-1 sm:mr-2 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                チームの課題
              </h3>
              {teamChallenges.length > 0 ? (
                <ul className="space-y-2 sm:space-y-4">
                  {teamChallenges.map((challenge) => (
                    <li key={challenge.id} className="bg-red-50 p-2 sm:p-3 rounded-lg">
                      <div className="flex mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mt-0.5 mr-1 sm:mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 font-medium text-xs sm:text-sm">{challenge.text}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 ml-5 sm:ml-7 mb-2">{challenge.detail}</p>
                      <div className="bg-white p-2 rounded border border-red-100 ml-5 sm:ml-7">
                        <p className="text-xs sm:text-sm text-gray-600 font-medium">解決策: </p>
                        <p className="text-xs sm:text-sm text-gray-600">{challenge.solution}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-xs sm:text-sm">現在のチーム構成では特に大きな課題は見つかりませんでした。</p>
              )}
            </Card>
          </div>
          
          {/* エンジニアリングコンテキスト特化の分析 */}
          <div className="mt-10 sm:mt-12 mb-6 sm:mb-8">
            <Card className="shadow-md rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium gradient-text mb-3 sm:mb-4 flex items-center">
                <svg width="16" height="16" className="sm:w-5 sm:h-5 mr-1 sm:mr-2 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                  <path d="M2 2l7.586 7.586"></path>
                  <circle cx="11" cy="11" r="2"></circle>
                </svg>
                開発フェーズ別適性分析
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                チームメンバーのMBTIタイプとスキルを分析し、各開発フェーズにおける強みと課題を評価しています。各フェーズに対する適性度を確認できます。
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 pb-2">
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
                    <div key={phase.id} className={`border rounded-lg p-3 sm:p-4 ${colorClass}`}>
                      <h4 className="text-xs sm:text-sm font-semibold mb-2 leading-tight">{phase.name}</h4>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mb-2 sm:mb-3">
                        <div 
                          className={`h-1.5 sm:h-2 rounded-full ${suitabilityPercentage >= 70 ? 'bg-green-600' : suitabilityPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${suitabilityPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] sm:text-xs">{suitabilityPercentage}% 適合</p>
                      
                      <div className="mt-2 sm:mt-3">
                        <p className="text-[10px] sm:text-xs text-gray-600 mb-1">推奨スキル:</p>
                        <div className="flex flex-wrap gap-1">
                          {phase.keySkills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-white/70 rounded-full truncate">
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
                      
                      <div className="bg-gray-50 p-4 rounded-lg mt-5">
                        <h5 className="text-sm font-medium mb-2">推奨事項</h5>
                        {getBestRecommendation(projectType)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
          
          {/* Additional Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
            {/* Team Abilities Radar Chart */}
            <Card className="shadow-md rounded-lg p-4 sm:p-6 md:col-span-2">
              <h3 className="text-base sm:text-lg font-medium gradient-text mb-3 sm:mb-4">チーム能力分析</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                MBTIタイプに基づく各メンバーのスキルセットとチーム全体の能力バランスを視覚化しています。
              </p>
              
              <div className="h-64 sm:h-80">
                {selectedMembers.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={teamRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="axis" tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} />
                      <Radar name="チーム平均" dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500 text-sm">
                      チームメンバーが選択されていないため、分析できません。
                    </p>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Team Metrics */}
            <Card className="shadow-md rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium gradient-text mb-3 sm:mb-4">チームメトリクス</h3>
              
              <div className="space-y-6">
                {/* Team Cohesion */}
                <div>
                  <div className="flex justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">チーム統合指数</h4>
                    <span className={`text-sm font-bold ${
                      cohesionScore >= 70 ? 'text-green-600' : 
                      cohesionScore >= 40 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {cohesionScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        cohesionScore >= 70 ? 'bg-green-600' : 
                        cohesionScore >= 40 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${cohesionScore}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    メンバー間の相性と協力関係の評価です。高いほどチームとしての一体感が強く、効率的に協働できます。
                  </p>
                </div>
                
                {/* Team Diversity */}
                <div>
                  <div className="flex justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">チーム多様性指数</h4>
                    <span className={`text-sm font-bold ${
                      diversityScore >= 70 ? 'text-green-600' : 
                      diversityScore >= 40 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {diversityScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        diversityScore >= 70 ? 'bg-green-600' : 
                        diversityScore >= 40 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${diversityScore}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    MBTIタイプとスキルの多様性の評価です。高いほど様々な視点やアプローチが期待でき、創造的な問題解決が可能になります。
                  </p>
                </div>
                
                {/* Individual Contributions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">メンバー貢献度</h4>
                  {selectedMembers.length > 0 ? (
                    <div className="space-y-2">
                      {selectedMembers.map(member => {
                        // 個人のスキルセットの多様性を簡易評価 (1-10)
                        const skillDiversity = member.skills ? 
                          Math.min(10, member.skills.length * 2) : 3;
                        
                        // MBTIタイプに基づく適性評価
                        let aptitudeScore = 5; // デフォルト値
                        const mbti = member.mbtiType;
                        
                        if (mbti.includes("NT")) aptitudeScore += 2;
                        if (mbti.includes("SJ")) aptitudeScore += 1;
                        if (mbti.includes("NF")) aptitudeScore += 1;
                        if (mbti.startsWith("E")) aptitudeScore += 1;
                        
                        // 総合的な貢献度スコア (30-100)
                        const contributionScore = Math.min(100, 30 + 
                          skillDiversity * 3 + aptitudeScore * 4);
                        
                        return (
                          <div key={member.id} className="flex items-center">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                {getUserInitials(member.username)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="ml-2 text-xs w-20 truncate">{member.username.split(' ')[0]}</span>
                            <div className="flex-1 ml-2">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full" 
                                  style={{ width: `${contributionScore}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="ml-2 text-xs font-medium">{Math.round(contributionScore)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      チームメンバーが選択されていません。
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>チームメンバーを追加</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                className="w-full"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="山田 太郎"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mbtiType">MBTIタイプ</Label>
              <Select
                value={newMember.mbtiType}
                onValueChange={(value) => setNewMember({ ...newMember, mbtiType: value })}
              >
                <SelectTrigger id="mbtiType">
                  <SelectValue placeholder="MBTIタイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTJ">INTJ - 建築家</SelectItem>
                  <SelectItem value="INTP">INTP - 論理学者</SelectItem>
                  <SelectItem value="ENTJ">ENTJ - 指揮官</SelectItem>
                  <SelectItem value="ENTP">ENTP - 討論者</SelectItem>
                  <SelectItem value="INFJ">INFJ - 提唱者</SelectItem>
                  <SelectItem value="INFP">INFP - 仲介者</SelectItem>
                  <SelectItem value="ENFJ">ENFJ - 主人公</SelectItem>
                  <SelectItem value="ENFP">ENFP - 広報運動家</SelectItem>
                  <SelectItem value="ISTJ">ISTJ - 管理者</SelectItem>
                  <SelectItem value="ISFJ">ISFJ - 擁護者</SelectItem>
                  <SelectItem value="ESTJ">ESTJ - 幹部</SelectItem>
                  <SelectItem value="ESFJ">ESFJ - 領事官</SelectItem>
                  <SelectItem value="ISTP">ISTP - 巨匠</SelectItem>
                  <SelectItem value="ISFP">ISFP - 冒険家</SelectItem>
                  <SelectItem value="ESTP">ESTP - 起業家</SelectItem>
                  <SelectItem value="ESFP">ESFP - エンターテイナー</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">役割</Label>
              <Select
                value={newMember.role}
                onValueChange={(value) => setNewMember({ ...newMember, role: value })}
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
            <div className="space-y-2">
              <Label>スキル</Label>
              <div className="border rounded-md p-3 h-32 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => (
                    <div
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`cursor-pointer text-xs px-2 py-1 rounded-full ${
                        isSkillSelected(skill) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearSelectedSkills}>
                  クリア
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddMemberDialog(false)}
            >
              キャンセル
            </Button>
            <Button 
              onClick={handleAddNewMember}
              disabled={!newMember.name || !newMember.mbtiType}
            >
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}