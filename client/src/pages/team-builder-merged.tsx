import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TEAM_GOAL_OPTIONS, TEAM_SIZE_OPTIONS, TEAM_PRIORITY_OPTIONS, TEAM_DURATION_OPTIONS } from "@/lib/constants";
import { getCompatibility, getCompatibilityColorClass } from "@/lib/constants";

interface TeamMember {
  id: number;
  username: string;
  mbtiType: string;
  selected: boolean;
  role?: string;
  skills?: string;
}

export default function TeamBuilder() {
  const { toast } = useToast();
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("setup");
  const [teamSettings, setTeamSettings] = useState({
    name: "",
    description: "",
    goal: TEAM_GOAL_OPTIONS[0],
    size: TEAM_SIZE_OPTIONS[0],
    priority: TEAM_PRIORITY_OPTIONS[0],
    duration: TEAM_DURATION_OPTIONS[0]
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 1,
      username: "田中 陽子",
      mbtiType: "ENTJ",
      selected: true,
      role: "プロジェクトマネージャー",
      skills: "プロジェクト管理, リーダーシップ"
    },
    {
      id: 2,
      username: "鈴木 健太",
      mbtiType: "INTP",
      selected: true,
      role: "システムアナリスト",
      skills: "分析, 問題解決, 技術開発"
    },
    {
      id: 3,
      username: "佐藤 美咲",
      mbtiType: "ENFJ",
      selected: true,
      role: "マーケティングディレクター",
      skills: "コミュニケーション, チームビルディング"
    }
  ]);
  const [newMember, setNewMember] = useState({
    name: "",
    mbtiType: "",
    role: "",
    skills: ""
  });
  
  const handleTeamSettingChange = (field: string, value: string) => {
    setTeamSettings(prev => ({
      ...prev,
      [field]: value
    }));
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
      skills: ""
    });
    
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
        return "bg-blue-100 text-blue-800";
      case "アナリスト":
        return "bg-green-100 text-green-800";
      case "コミュニケーター":
        return "bg-purple-100 text-purple-800";
      case "オーガナイザー":
        return "bg-orange-100 text-orange-800";
      case "イノベーター":
        return "bg-pink-100 text-pink-800";
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
  
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">チーム編成と分析</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="setup">チーム設定</TabsTrigger>
              <TabsTrigger value="analysis">チーム分析</TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup" className="mt-6">
              <Card className="shadow-md rounded-lg p-6 mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">チーム編成のための条件設定</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="team-name">チーム名</Label>
                    <Input
                      id="team-name"
                      value={teamSettings.name}
                      onChange={(e) => handleTeamSettingChange("name", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="team-description">チームの説明</Label>
                    <Textarea
                      id="team-description"
                      value={teamSettings.description}
                      onChange={(e) => handleTeamSettingChange("description", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="team-goal">チームの目標</Label>
                    <Select
                      value={teamSettings.goal}
                      onValueChange={(value) => handleTeamSettingChange("goal", value)}
                    >
                      <SelectTrigger id="team-goal" className="mt-1">
                        <SelectValue placeholder="目標を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAM_GOAL_OPTIONS.map((goal) => (
                          <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="team-size">チームの人数</Label>
                    <Select
                      value={teamSettings.size}
                      onValueChange={(value) => handleTeamSettingChange("size", value)}
                    >
                      <SelectTrigger id="team-size" className="mt-1">
                        <SelectValue placeholder="人数を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAM_SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">優先する要素</Label>
                    <Select
                      value={teamSettings.priority}
                      onValueChange={(value) => handleTeamSettingChange("priority", value)}
                    >
                      <SelectTrigger id="priority" className="mt-1">
                        <SelectValue placeholder="優先要素を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAM_PRIORITY_OPTIONS.map((priority) => (
                          <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">プロジェクト期間</Label>
                    <Select
                      value={teamSettings.duration}
                      onValueChange={(value) => handleTeamSettingChange("duration", value)}
                    >
                      <SelectTrigger id="duration" className="mt-1">
                        <SelectValue placeholder="期間を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAM_DURATION_OPTIONS.map((duration) => (
                          <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
              
              {/* Team Members Selection */}
              <Card className="shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">チームメンバー選択</h3>
                  <Button 
                    variant="ghost" 
                    className="text-primary hover:text-primary/80 flex items-center"
                    onClick={() => setShowAddMemberDialog(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button onClick={handleAnalyzeTeam}>
                    チームを分析する
                  </Button>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="analysis" className="mt-6">
              {/* Team Composition Overview */}
              <Card className="shadow-md rounded-lg p-6 mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">チーム構成概要</h3>
                
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">チーム相性マトリックス</h3>
                
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
                  <h3 className="text-lg font-medium text-green-600 mb-4">チームの強み</h3>
                  <ul className="space-y-3">
                    {selectedMembers.some(m => m.mbtiType.includes('ENT')) && (
                      <li className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">リーダーシップとビジョン設定の能力（ENTJ/ENTP）</span>
                      </li>
                    )}
                    {selectedMembers.some(m => m.mbtiType.includes('INT')) && (
                      <li className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">論理的分析と問題解決能力（INTJ/INTP）</span>
                      </li>
                    )}
                    {selectedMembers.some(m => m.mbtiType.includes('NFJ')) && (
                      <li className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">チームの調和を保つ能力（ENFJ/INFJ）</span>
                      </li>
                    )}
                    {selectedMembers.some(m => m.mbtiType.includes('STJ')) && (
                      <li className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">実務的で組織的な実行力（ESTJ/ISTJ）</span>
                      </li>
                    )}
                    {selectedMembers.some(m => m.mbtiType.includes('NFP')) && (
                      <li className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">創造性と柔軟な発想（ENFP/INFP）</span>
                      </li>
                    )}
                  </ul>
                </Card>
                
                {/* Challenges */}
                <Card className="shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-medium text-red-600 mb-4">チームの課題</h3>
                  <ul className="space-y-3">
                    {mbtiDistribution.tVsF.T > mbtiDistribution.tVsF.F * 2 && (
                      <li className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">感情面への配慮が不足する可能性（T型が多い）</span>
                      </li>
                    )}
                    {mbtiDistribution.tVsF.F > mbtiDistribution.tVsF.T * 2 && (
                      <li className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">客観的な判断が難しい場合がある（F型が多い）</span>
                      </li>
                    )}
                    {mbtiDistribution.jVsP.J > mbtiDistribution.jVsP.P * 2 && (
                      <li className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">柔軟性に欠ける可能性がある（J型が多い）</span>
                      </li>
                    )}
                    {mbtiDistribution.jVsP.P > mbtiDistribution.jVsP.J * 2 && (
                      <li className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">締め切りや計画の遵守が難しい場合がある（P型が多い）</span>
                      </li>
                    )}
                    {mbtiDistribution.eVsI.I > mbtiDistribution.eVsI.E * 2 && (
                      <li className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">活発なコミュニケーションが不足する可能性（I型が多い）</span>
                      </li>
                    )}
                  </ul>
                </Card>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button onClick={() => setActiveTab("setup")}>
                  チーム編成に戻る
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Add Member Dialog */}
          <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しいメンバーを追加</DialogTitle>
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
                  <Input
                    id="role"
                    value={newMember.role}
                    onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="例: プロジェクトマネージャー"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="skills">スキル・強み</Label>
                  <Input
                    id="skills"
                    value={newMember.skills}
                    onChange={(e) => setNewMember(prev => ({ ...prev, skills: e.target.value }))}
                    placeholder="例: プロジェクト管理, リーダーシップ"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" onClick={handleAddNewMember} disabled={!newMember.name || !newMember.mbtiType}>
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}