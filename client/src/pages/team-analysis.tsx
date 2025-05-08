import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getCompatibility, getCompatibilityColorClass } from "@/lib/constants";

interface User {
  id: number;
  username: string;
  email?: string;
  mbtiType?: string;
}

interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  role?: string;
  skills?: string;
  isSelected: boolean;
  user?: {
    id: number;
    username: string;
    email?: string;
    mbtiType?: string;
  }
}

interface Team {
  id: number;
  name: string;
  description?: string;
  goal?: string;
  size?: number;
  duration?: string;
  priority?: string;
  createdBy: number;
  createdAt: Date;
}

export default function TeamAnalysis() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  
  // チーム一覧を取得
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['/api/teams/user/1'], // 仮のユーザーID
  });
  
  // 選択されたチームのメンバーを取得
  const { data: teamMembers = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['/api/team-members', selectedTeamId],
    enabled: !!selectedTeamId,
  });
  
  // 初期チーム選択
  useEffect(() => {
    if (!isLoadingTeams && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [isLoadingTeams, teams, selectedTeamId]);
  
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
  
  // メンバーにMBTIタイプに合わせたロールを割り当てる
  const assignRoleByMbtiType = (mbtiType?: string): string => {
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
    const members = teamMembers.map((member: TeamMember) => member.user);
    
    // Eか I かの数
    const eCount = members.filter((user: User) => user?.mbtiType?.startsWith("E")).length;
    const iCount = members.filter((user: User) => user?.mbtiType?.startsWith("I")).length;
    
    // Sか N かの数
    const sCount = members.filter((user: User) => user?.mbtiType?.[1] === "S").length;
    const nCount = members.filter((user: User) => user?.mbtiType?.[1] === "N").length;
    
    // Tか F かの数
    const tCount = members.filter((user: User) => user?.mbtiType?.[2] === "T").length;
    const fCount = members.filter((user: User) => user?.mbtiType?.[2] === "F").length;
    
    // Jか P かの数
    const jCount = members.filter((user: User) => user?.mbtiType?.[3] === "J").length;
    const pCount = members.filter((user: User) => user?.mbtiType?.[3] === "P").length;
    
    return {
      eVsI: { E: eCount, I: iCount },
      sVsN: { S: sCount, N: nCount },
      tVsF: { T: tCount, F: fCount },
      jVsP: { J: jCount, P: pCount }
    };
  };
  
  // チーム分析のダミーデータ
  // 実際のアプリケーションではAPIからデータを取得する
  const dummyTeams: Team[] = [
    {
      id: 1,
      name: "開発チームA",
      description: "新機能の開発を担当するチーム",
      goal: "問題解決型チーム",
      size: 3,
      duration: "長期（3ヶ月以上）",
      priority: "役割バランス",
      createdBy: 1,
      createdAt: new Date()
    },
    {
      id: 2,
      name: "マーケティングチーム",
      description: "プロモーション施策を企画するチーム",
      goal: "創造的プロジェクト",
      size: 4,
      duration: "中期（1-3ヶ月）",
      priority: "多様性の確保",
      createdBy: 1,
      createdAt: new Date()
    }
  ];
  
  const dummyTeamMembers: TeamMember[] = [
    {
      id: 1,
      teamId: 1,
      userId: 1,
      role: "プロジェクトマネージャー",
      skills: "プロジェクト管理, リーダーシップ",
      isSelected: true,
      user: {
        id: 1,
        username: "田中 陽子",
        email: "tanaka@example.com",
        mbtiType: "ENTJ"
      }
    },
    {
      id: 2,
      teamId: 1,
      userId: 2,
      role: "システムアナリスト",
      skills: "分析, 問題解決, 技術開発",
      isSelected: true,
      user: {
        id: 2,
        username: "鈴木 健太",
        email: "suzuki@example.com",
        mbtiType: "INTP"
      }
    },
    {
      id: 3,
      teamId: 1,
      userId: 3,
      role: "マーケティングディレクター",
      skills: "コミュニケーション, チームビルディング",
      isSelected: true,
      user: {
        id: 3,
        username: "佐藤 美咲",
        email: "sato@example.com",
        mbtiType: "ENFJ"
      }
    }
  ];
  
  // APIからデータが取得できない場合はダミーデータを使用
  const displayTeams = teams.length > 0 ? teams : dummyTeams;
  const displayMembers = teamMembers.length > 0 ? teamMembers : dummyTeamMembers;
  
  // 表示するチームを取得
  const selectedTeam = displayTeams.find((team: Team) => team.id === selectedTeamId) || displayTeams[0];
  
  // MBTIタイプの分布
  const mbtiDistribution = calculateMbtiDistribution();
  
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">チーム分析</h2>
          
          {/* Team Selector */}
          <div className="mb-6">
            <Label htmlFor="team-select">チームを選択</Label>
            <Select
              value={selectedTeamId?.toString() || ''}
              onValueChange={(value) => setSelectedTeamId(parseInt(value))}
            >
              <SelectTrigger id="team-select" className="mt-1">
                <SelectValue placeholder="チームを選択" />
              </SelectTrigger>
              <SelectContent>
                {displayTeams.map((team: Team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Team Composition Overview */}
          <Card className="shadow-md rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">チーム構成概要</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Team Members */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">チームメンバー</h4>
                <ul className="space-y-3">
                  {displayMembers.map((member: TeamMember) => {
                    const user = member.user!;
                    const role = assignRoleByMbtiType(user.mbtiType);
                    const roleClass = getRoleBadgeClass(role);
                    
                    return (
                      <li key={member.id} className="flex items-center">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                            {getUserInitials(user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.mbtiType || "不明"}</p>
                        </div>
                        <span className={`ml-auto px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleClass}`}>
                          {role}
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
                    {displayMembers.map((member: TeamMember) => (
                      <th key={member.id} className="px-4 py-2 text-center text-sm">
                        {member.user!.username.split(' ')[0]} ({member.user!.mbtiType || "不明"})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayMembers.map((row: TeamMember) => (
                    <tr key={row.id}>
                      <td className="px-4 py-2 font-medium text-sm">
                        {row.user!.username.split(' ')[0]} ({row.user!.mbtiType || "不明"})
                      </td>
                      {displayMembers.map((col: TeamMember) => {
                        // 自分自身との相性は表示しない
                        if (row.id === col.id) {
                          return (
                            <td key={col.id} className="px-4 py-2 text-center bg-gray-100">
                              -
                            </td>
                          );
                        }
                        
                        const compatibility = getCompatibility(
                          row.user?.mbtiType || "", 
                          col.user?.mbtiType || ""
                        );
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
                {displayMembers.some(m => m.user?.mbtiType?.includes('ENT')) && (
                  <li className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">リーダーシップとビジョン設定の能力（ENTJ/ENTP）</span>
                  </li>
                )}
                {displayMembers.some(m => m.user?.mbtiType?.includes('INT')) && (
                  <li className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">論理的分析と問題解決能力（INTJ/INTP）</span>
                  </li>
                )}
                {displayMembers.some(m => m.user?.mbtiType?.includes('ENF')) && (
                  <li className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">チーム内外のコミュニケーション力（ENFJ/ENFP）</span>
                  </li>
                )}
                {mbtiDistribution.eVsI.E > 0 && mbtiDistribution.eVsI.I > 0 && (
                  <li className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">内向型と外向型のバランスが取れている</span>
                  </li>
                )}
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">異なる視点からの意見交換が活発になる可能性</span>
                </li>
              </ul>
            </Card>
            
            {/* Challenges */}
            <Card className="shadow-md rounded-lg p-6">
              <h3 className="text-lg font-medium text-orange-600 mb-4">チームの課題</h3>
              <ul className="space-y-3">
                {mbtiDistribution.sVsN.S === 0 && (
                  <li className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">感覚型（S）メンバーが不足している</span>
                  </li>
                )}
                {displayMembers.some(m => m.user?.mbtiType === 'ENTJ') && 
                 displayMembers.some(m => m.user?.mbtiType === 'ENFJ') && (
                  <li className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">ENTJとENFJの間に意見の相違が生じる可能性</span>
                  </li>
                )}
                {mbtiDistribution.sVsN.N > mbtiDistribution.sVsN.S && (
                  <li className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">細部への注意が不足する可能性がある</span>
                  </li>
                )}
                {mbtiDistribution.jVsP.J > mbtiDistribution.jVsP.P && (
                  <li className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">決断が早すぎて、検討が不十分になる恐れ</span>
                  </li>
                )}
              </ul>
            </Card>
          </div>
          
          {/* Recommendations */}
          <Card className="shadow-md rounded-lg p-6 mt-8">
            <h3 className="text-lg font-medium text-primary mb-4">チーム改善のための推奨事項</h3>
            <ul className="space-y-3">
              {mbtiDistribution.sVsN.S < mbtiDistribution.sVsN.N && (
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  <span className="text-gray-700">ISTJ/ISFJなどの感覚型・判断型メンバーの追加を検討する</span>
                </li>
              )}
              {displayMembers.some(m => m.user?.mbtiType === 'ENTJ') && 
               displayMembers.some(m => m.user?.mbtiType === 'ENFJ') && (
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  <span className="text-gray-700">ENTJとENFJの間の定期的な1on1ミーティングを設定する</span>
                </li>
              )}
              {displayMembers.some(m => m.user?.mbtiType === 'INTP') && (
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  <span className="text-gray-700">INTPの分析的能力を活かすために、意思決定前の検討時間を確保する</span>
                </li>
              )}
              <li className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                <span className="text-gray-700">実装フェーズではより詳細なチェックリストを活用する</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
