import { 
  users, type User, type InsertUser,
  testResponses, type TestResponse, type InsertTestResponse,
  teams, type Team, type InsertTeam,
  teamMembers, type TeamMember, type InsertTeamMember
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserMbtiType(userId: number, mbtiType: string): Promise<User | undefined>;
  
  // Test response methods
  createTestResponse(response: InsertTestResponse): Promise<TestResponse>;
  getTestResponsesByUserId(userId: number): Promise<TestResponse[]>;
  
  // Team methods
  createTeam(team: InsertTeam): Promise<Team>;
  getTeam(id: number): Promise<Team | undefined>;
  getTeamsByUserId(userId: number): Promise<Team[]>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team | undefined>;
  
  // Team member methods
  addMemberToTeam(member: InsertTeamMember): Promise<TeamMember>;
  getTeamMembers(teamId: number): Promise<TeamMember[]>;
  updateTeamMember(id: number, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  removeMemberFromTeam(id: number): Promise<boolean>;
  
  // Utility methods
  getAllUsers(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private testResponses: Map<number, TestResponse>;
  private teams: Map<number, Team>;
  private teamMembers: Map<number, TeamMember>;
  private userIdCounter: number;
  private testResponseIdCounter: number;
  private teamIdCounter: number;
  private teamMemberIdCounter: number;

  constructor() {
    this.users = new Map();
    this.testResponses = new Map();
    this.teams = new Map();
    this.teamMembers = new Map();
    this.userIdCounter = 1;
    this.testResponseIdCounter = 1;
    this.teamIdCounter = 1;
    this.teamMemberIdCounter = 1;
    
    // Add some initial users for testing
    this.createUser({ 
      username: "test_user", 
      password: "password", 
      email: "test@example.com", 
      mbtiType: "ENFJ" 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserMbtiType(userId: number, mbtiType: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, mbtiType };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Test response methods
  async createTestResponse(insertResponse: InsertTestResponse): Promise<TestResponse> {
    const id = this.testResponseIdCounter++;
    const completedAt = new Date();
    const response: TestResponse = { ...insertResponse, id, completedAt };
    this.testResponses.set(id, response);
    return response;
  }
  
  async getTestResponsesByUserId(userId: number): Promise<TestResponse[]> {
    return Array.from(this.testResponses.values()).filter(
      (response) => response.userId === userId
    );
  }
  
  // Team methods
  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.teamIdCounter++;
    const createdAt = new Date();
    const team: Team = { ...insertTeam, id, createdAt };
    this.teams.set(id, team);
    return team;
  }
  
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }
  
  async getTeamsByUserId(userId: number): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(
      (team) => team.createdBy === userId
    );
  }
  
  async updateTeam(id: number, teamUpdate: Partial<InsertTeam>): Promise<Team | undefined> {
    const team = await this.getTeam(id);
    if (!team) return undefined;
    
    const updatedTeam = { ...team, ...teamUpdate };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }
  
  // Team member methods
  async addMemberToTeam(insertMember: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMemberIdCounter++;
    const member: TeamMember = { ...insertMember, id };
    this.teamMembers.set(id, member);
    return member;
  }
  
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values()).filter(
      (member) => member.teamId === teamId
    );
  }
  
  async updateTeamMember(id: number, memberUpdate: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const member = this.teamMembers.get(id);
    if (!member) return undefined;
    
    const updatedMember = { ...member, ...memberUpdate };
    this.teamMembers.set(id, updatedMember);
    return updatedMember;
  }
  
  async removeMemberFromTeam(id: number): Promise<boolean> {
    return this.teamMembers.delete(id);
  }
  
  // Utility methods
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}

export const storage = new MemStorage();
