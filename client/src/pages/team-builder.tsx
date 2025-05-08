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
import { getCompatibility, getCompatibilityColorClass } from "@/lib/constants";
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
      username: "田中 陽子",
      mbtiType: "ENTJ",
      selected: true,
      role: "プロジェクトマネージャー",
      skills: ["プロジェクト管理", "リーダーシップ"]
    },
    {
      id: 2,
      username: "鈴木 健太",
      mbtiType: "INTP",
      selected: true,
      role: "システムアナリスト",
      skills: ["分析", "問題解決", "技術開発"]
    },
    {
      id: 3,
      username: "佐藤 美咲",
      mbtiType: "ENFJ",
      selected: true,
      role: "マーケティングディレクター",
      skills: ["コミュニケーション", "チームビルディング"]
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
  
  const teamStrengths = getTeamStrengths();
  const teamChallenges = getTeamChallenges();
  
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
                    variant="outline" 
                    className="bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary flex items-center"
                    onClick={() => setShowAddMemberDialog(true)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
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
                  <Button onClick={handleAnalyzeTeam} className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
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
              
              <div className="mt-8 flex justify-center">
                <Button 
                  onClick={() => setActiveTab("setup")}
                  variant="outline"
                  className="border-primary/20 hover:bg-primary/5"
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