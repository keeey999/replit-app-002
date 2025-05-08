import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertTestResponseSchema, 
  insertTeamSchema, 
  insertTeamMemberSchema 
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = (path: string) => `/api${path}`;

  // Auth routes
  app.post(apiRouter("/register"), async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "ユーザー名はすでに使用されています" });
      }
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "ユーザー登録に失敗しました" });
    }
  });
  
  app.post(apiRouter("/login"), async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "ユーザー名とパスワードを入力してください" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "ユーザー名またはパスワードが正しくありません" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "ログインに失敗しました" });
    }
  });
  
  // MBTI Test routes
  app.post(apiRouter("/test-response"), async (req: Request, res: Response) => {
    try {
      const testData = insertTestResponseSchema.parse(req.body);
      const user = await storage.getUser(testData.userId);
      
      if (!user) {
        return res.status(404).json({ message: "ユーザーが見つかりません" });
      }
      
      const response = await storage.createTestResponse(testData);
      
      // Update user's MBTI type
      await storage.updateUserMbtiType(user.id, testData.result);
      
      return res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "テスト結果の保存に失敗しました" });
    }
  });
  
  app.get(apiRouter("/test-responses/:userId"), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "有効なユーザーIDを指定してください" });
      }
      
      const responses = await storage.getTestResponsesByUserId(userId);
      return res.status(200).json(responses);
    } catch (error) {
      return res.status(500).json({ message: "テスト結果の取得に失敗しました" });
    }
  });
  
  // Team routes
  app.post(apiRouter("/teams"), async (req: Request, res: Response) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      const user = await storage.getUser(teamData.createdBy);
      
      if (!user) {
        return res.status(404).json({ message: "ユーザーが見つかりません" });
      }
      
      const team = await storage.createTeam(teamData);
      return res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "チームの作成に失敗しました" });
    }
  });
  
  app.get(apiRouter("/teams/:id"), async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.id);
      
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "有効なチームIDを指定してください" });
      }
      
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "チームが見つかりません" });
      }
      
      return res.status(200).json(team);
    } catch (error) {
      return res.status(500).json({ message: "チームの取得に失敗しました" });
    }
  });
  
  app.get(apiRouter("/teams/user/:userId"), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "有効なユーザーIDを指定してください" });
      }
      
      const teams = await storage.getTeamsByUserId(userId);
      return res.status(200).json(teams);
    } catch (error) {
      return res.status(500).json({ message: "チームの取得に失敗しました" });
    }
  });
  
  app.put(apiRouter("/teams/:id"), async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.id);
      
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "有効なチームIDを指定してください" });
      }
      
      const teamData = req.body;
      const updatedTeam = await storage.updateTeam(teamId, teamData);
      
      if (!updatedTeam) {
        return res.status(404).json({ message: "チームが見つかりません" });
      }
      
      return res.status(200).json(updatedTeam);
    } catch (error) {
      return res.status(500).json({ message: "チームの更新に失敗しました" });
    }
  });
  
  // Team Member routes
  app.post(apiRouter("/team-members"), async (req: Request, res: Response) => {
    try {
      const memberData = insertTeamMemberSchema.parse(req.body);
      const team = await storage.getTeam(memberData.teamId);
      const user = await storage.getUser(memberData.userId);
      
      if (!team) {
        return res.status(404).json({ message: "チームが見つかりません" });
      }
      
      if (!user) {
        return res.status(404).json({ message: "ユーザーが見つかりません" });
      }
      
      const member = await storage.addMemberToTeam(memberData);
      return res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "メンバーの追加に失敗しました" });
    }
  });
  
  app.get(apiRouter("/team-members/:teamId"), async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.teamId);
      
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "有効なチームIDを指定してください" });
      }
      
      const members = await storage.getTeamMembers(teamId);
      
      // Get user details for each member
      const memberDetails = await Promise.all(
        members.map(async (member) => {
          const user = await storage.getUser(member.userId);
          return {
            ...member,
            user: user ? { 
              id: user.id, 
              username: user.username, 
              email: user.email,
              mbtiType: user.mbtiType 
            } : null,
          };
        })
      );
      
      return res.status(200).json(memberDetails);
    } catch (error) {
      return res.status(500).json({ message: "メンバーの取得に失敗しました" });
    }
  });
  
  app.put(apiRouter("/team-members/:id"), async (req: Request, res: Response) => {
    try {
      const memberId = parseInt(req.params.id);
      
      if (isNaN(memberId)) {
        return res.status(400).json({ message: "有効なメンバーIDを指定してください" });
      }
      
      const memberData = req.body;
      const updatedMember = await storage.updateTeamMember(memberId, memberData);
      
      if (!updatedMember) {
        return res.status(404).json({ message: "メンバーが見つかりません" });
      }
      
      return res.status(200).json(updatedMember);
    } catch (error) {
      return res.status(500).json({ message: "メンバーの更新に失敗しました" });
    }
  });
  
  app.delete(apiRouter("/team-members/:id"), async (req: Request, res: Response) => {
    try {
      const memberId = parseInt(req.params.id);
      
      if (isNaN(memberId)) {
        return res.status(400).json({ message: "有効なメンバーIDを指定してください" });
      }
      
      const result = await storage.removeMemberFromTeam(memberId);
      
      if (!result) {
        return res.status(404).json({ message: "メンバーが見つかりません" });
      }
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "メンバーの削除に失敗しました" });
    }
  });
  
  // User routes
  app.get(apiRouter("/users"), async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.status(200).json(safeUsers);
    } catch (error) {
      return res.status(500).json({ message: "ユーザーの取得に失敗しました" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
