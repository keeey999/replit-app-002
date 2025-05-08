import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TEAM_GOAL_OPTIONS, TEAM_SIZE_OPTIONS, TEAM_PRIORITY_OPTIONS, TEAM_DURATION_OPTIONS } from "@/lib/constants";

interface User {
  id: number;
  username: string;
  email?: string;
  mbtiType?: string;
}

interface TeamMember extends User {
  selected: boolean;
  role?: string;
  skills?: string;
}

export default function TeamBuilder() {
  const { toast } = useToast();
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [teamSettings, setTeamSettings] = useState({
    name: "",
    description: "",
    goal: TEAM_GOAL_OPTIONS[0],
    size: TEAM_SIZE_OPTIONS[0],
    priority: TEAM_PRIORITY_OPTIONS[0],
    duration: TEAM_DURATION_OPTIONS[0]
  });
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    mbtiType: "",
    role: "",
    skills: ""
  });
  
  // ユーザー一覧を取得
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // デモユーザーを作成 (実際のアプリケーションではAPIから取得)
  useEffect(() => {
    if (!isLoadingUsers && users.length) {
      const teamMembers: TeamMember[] = users.map((user: User) => ({
        ...user,
        selected: false,
        role: "",
        skills: ""
      }));
      setSelectedMembers(teamMembers);
    } else if (!isLoadingUsers && !users.length) {
      // APIからデータが取得できない場合はダミーデータを設定
      const dummyMembers: TeamMember[] = [
        {
          id: 1,
          username: "田中 陽子",
          email: "tanaka@example.com",
          mbtiType: "ENTJ",
          selected: false,
          role: "プロジェクトマネージャー",
          skills: "プロジェクト管理, リーダーシップ"
        },
        {
          id: 2,
          username: "鈴木 健太",
          email: "suzuki@example.com",
          mbtiType: "INTP",
          selected: false,
          role: "システムアナリスト",
          skills: "分析, 問題解決, 技術開発"
        },
        {
          id: 3,
          username: "佐藤 美咲",
          email: "sato@example.com",
          mbtiType: "ENFJ",
          selected: false,
          role: "マーケティングディレクター",
          skills: "コミュニケーション, チームビルディング"
        }
      ];
      setSelectedMembers(dummyMembers);
    }
  }, [isLoadingUsers, users]);
  
  // チーム作成のミューテーション
  const createTeamMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/teams", data);
    },
    onSuccess: async (response) => {
      const teamData = await response.json();
      
      // 選択されたメンバーをチームに追加
      const selectedMemberPromises = selectedMembers
        .filter(member => member.selected)
        .map(member => 
          apiRequest("POST", "/api/team-members", {
            teamId: teamData.id,
            userId: member.id,
            role: member.role || "",
            skills: member.skills || "",
            isSelected: true
          })
        );
      
      await Promise.all(selectedMemberPromises);
      
      toast({
        title: "チームが作成されました",
        description: `チーム「${teamSettings.name}」の作成に成功しました。`,
      });
    },
    onError: () => {
      toast({
        title: "エラーが発生しました",
        description: "チームの作成に失敗しました。",
        variant: "destructive"
      });
    }
  });
  
  const handleTeamSettingChange = (field: string, value: string) => {
    setTeamSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleMemberSelection = (memberId: number, selected: boolean) => {
    setSelectedMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, selected } 
          : member
      )
    );
  };
  
  const handleAddNewMember = () => {
    // 新しいメンバーを追加 (実際のアプリケーションではAPIを呼び出す)
    const newId = Math.max(...selectedMembers.map(m => m.id), 0) + 1;
    const member: TeamMember = {
      id: newId,
      username: newMember.name,
      email: newMember.email,
      mbtiType: newMember.mbtiType,
      selected: true,
      role: newMember.role,
      skills: newMember.skills
    };
    
    setSelectedMembers(prev => [...prev, member]);
    setShowAddMemberDialog(false);
    setNewMember({
      name: "",
      email: "",
      mbtiType: "",
      role: "",
      skills: ""
    });
    
    toast({
      title: "メンバーが追加されました",
      description: `${newMember.name}がチームに追加されました。`,
    });
  };
  
  const handleOptimizeTeam = () => {
    // 実際のアプリケーションでは、選択されたメンバーのMBTIタイプに基づいて
    // 最適なチーム編成を提案するロジックを実装
    // ここではシンプルにチームを作成
    
    if (!teamSettings.name.trim()) {
      toast({
        title: "チーム名を入力してください",
        variant: "destructive"
      });
      return;
    }
    
    const selectedCount = selectedMembers.filter(m => m.selected).length;
    if (selectedCount === 0) {
      toast({
        title: "メンバーを選択してください",
        description: "少なくとも1人のメンバーを選択する必要があります。",
        variant: "destructive"
      });
      return;
    }
    
    // ダミーのユーザーID (実際のアプリケーションではログインユーザーのIDを使用)
    const userId = 1;
    
    createTeamMutation.mutate({
      name: teamSettings.name,
      description: teamSettings.description,
      goal: teamSettings.goal,
      size: teamSettings.size,
      priority: teamSettings.priority,
      duration: teamSettings.duration,
      createdBy: userId
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
  
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">チーム編成支援</h2>
          
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
                  {selectedMembers.map((member) => (
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
                            <div className="text-sm text-gray-500">{member.email}</div>
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
              <Button onClick={handleOptimizeTeam} disabled={createTeamMutation.isPending}>
                {createTeamMutation.isPending ? "処理中..." : "チーム編成を最適化"}
              </Button>
            </div>
          </Card>
          
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
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
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
                      {['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 
                        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'].map(type => (
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
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="skills">スキル（カンマ区切り）</Label>
                  <Input
                    id="skills"
                    value={newMember.skills}
                    onChange={(e) => setNewMember(prev => ({ ...prev, skills: e.target.value }))}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleAddNewMember} disabled={!newMember.name}>
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
