import { VideoDetails, BlogStyle } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Blog post generation cache
  getBlogPost(videoId: string, length: string, style: BlogStyle): Promise<BlogPost | undefined>;
  saveBlogPost(videoId: string, length: string, style: BlogStyle, data: BlogPost): Promise<BlogPost>;
}

// Import the base user types
import { users, type User, type InsertUser } from "@shared/schema";

// Define the BlogPost type for caching
import { BlogPost } from "@shared/schema";

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private blogPosts: Map<string, BlogPost>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.blogPosts = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Blog post cache methods
  async getBlogPost(videoId: string, length: string, style: BlogStyle): Promise<BlogPost | undefined> {
    const key = `${videoId}:${length}:${style}`;
    return this.blogPosts.get(key);
  }

  async saveBlogPost(videoId: string, length: string, style: BlogStyle, data: BlogPost): Promise<BlogPost> {
    const key = `${videoId}:${length}:${style}`;
    this.blogPosts.set(key, data);
    return data;
  }
}

export const storage = new MemStorage();
