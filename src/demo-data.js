/**
 * Demo Git Data for GitStoryboard when running outside a git repository or with --demo flag.
 */
module.exports = {
  meta: {
    repoName: "hyper-engine-v2",
    branch: "feature/smart-cache-and-auth-v2",
    targetBranch: "main",
    commitHash: "a8f9c12",
    author: "Alex Rivers <alex@devpulse.io>",
    date: new Date().toISOString(),
    totalFiles: 6,
    additions: 248,
    deletions: 62,
    impactScore: 84, // 0-100 scale based on churn, scope, complexity
    riskLevel: "Moderate Risk (Core Cache Modification)"
  },
  summary: {
    title: "Core Engine V2: Smart Distributed Cache & JWT Revocation",
    overview: "Introduces zero-downtime distributed LRU caching, automated JWT session invalidation, and optimizes database query pipeline throughput by 3.8x.",
    keyChanges: [
      "Implemented `SmartCacheManager` with dual-layer memory + Redis fallback.",
      "Added Token Revocation List (TRL) middleware to reject compromised JWTs instantly.",
      "Refactored database query builder to support stream-based batch processing.",
      "Added full unit & benchmark test coverage for LRU eviction logic."
    ],
    breakingChanges: [
      "`CacheProvider.get()` now returns a Promise instead of synchronous value."
    ],
    testingInstructions: "Run `npm test` and verify benchmark scripts in `test/cache.bench.js`."
  },
  chapters: [
    {
      id: "chapter-1",
      title: "Core Caching Subsystem",
      category: "Architecture & Logic",
      description: "Primary implementation of dual-layer caching engine with LRU eviction policy.",
      files: ["src/cache/SmartCache.ts", "src/cache/types.ts"]
    },
    {
      id: "chapter-2",
      title: "Security & Auth Layer",
      category: "Security",
      description: "Middleware for JWT token validation and real-time blacklisting.",
      files: ["src/middleware/authGuard.ts"]
    },
    {
      id: "chapter-3",
      title: "Database Query Optimizer",
      category: "Performance",
      description: "Batch query processor to mitigate N+1 query problem.",
      files: ["src/db/QueryStream.ts"]
    },
    {
      id: "chapter-4",
      title: "Testing & Validation",
      category: "Testing",
      description: "High-concurrency test suite for cache invalidation and load verification.",
      files: ["test/cache.test.ts", "package.json"]
    }
  ],
  files: [
    {
      path: "src/cache/SmartCache.ts",
      status: "added",
      additions: 112,
      deletions: 0,
      language: "typescript",
      hunks: [
        {
          header: "@@ -0,0 +1,112 @@",
          content: `+import { RedisClient } from '../drivers/redis';
+import { CacheOptions, CacheEntry } from './types';
+
+export class SmartCacheManager<T = any> {
+  private lruMap: Map<string, CacheEntry<T>>;
+  private capacity: number;
+  private redis: RedisClient | null;
+
+  constructor(options: CacheOptions) {
+    this.capacity = options.maxItems || 5000;
+    this.lruMap = new Map();
+    this.redis = options.redisUrl ? new RedisClient(options.redisUrl) : null;
+  }
+
+  public async get(key: string): Promise<T | null> {
+    if (this.lruMap.has(key)) {
+      const item = this.lruMap.get(key)!;
+      if (Date.now() > item.expiresAt) {
+        this.lruMap.delete(key);
+        return null;
+      }
+      // Refresh LRU order
+      this.lruMap.delete(key);
+      this.lruMap.set(key, item);
+      return item.value;
+    }
+
+    if (this.redis) {
+      const remoteValue = await this.redis.get<T>(key);
+      if (remoteValue) {
+        this.set(key, remoteValue, 300); // Backfill local memory cache
+        return remoteValue;
+      }
+    }
+    return null;
+  }
+
+  public set(key: string, value: T, ttlSeconds: number = 600): void {
+    if (this.lruMap.size >= this.capacity) {
+      const oldestKey = this.lruMap.keys().next().value;
+      if (oldestKey) this.lruMap.delete(oldestKey);
+    }
+    this.lruMap.set(key, {
+      value,
+      expiresAt: Date.now() + ttlSeconds * 1000
+    });
+  }
+}`
        }
      ]
    },
    {
      path: "src/cache/types.ts",
      status: "modified",
      additions: 18,
      deletions: 4,
      language: "typescript",
      hunks: [
        {
          header: "@@ -12,4 +12,18 @@",
          content: ` export interface CacheOptions {
-  maxItems?: number;
+  maxItems?: number;
+  redisUrl?: string;
+  enableMetrics?: boolean;
 }

+export interface CacheEntry<T> {
+  value: T;
+  expiresAt: number;
+}
+
+export interface CacheMetrics {
+  hits: number;
+  misses: number;
+  evictions: number;
+}`
        }
      ]
    },
    {
      path: "src/middleware/authGuard.ts",
      status: "modified",
      additions: 45,
      deletions: 12,
      language: "typescript",
      hunks: [
        {
          header: "@@ -24,12 +24,45 @@",
          content: `-export function authenticateToken(req, res, next) {
-  const token = req.headers['authorization'];
-  if (!token) return res.sendStatus(401);
-  jwt.verify(token, process.env.SECRET, (err, user) => {
-    if (err) return res.sendStatus(403);
-    req.user = user;
-    next();
-  });
-}
+import { SmartCacheManager } from '../cache/SmartCache';
+
+const tokenBlacklist = new SmartCacheManager({ maxItems: 10000 });
+
+export async function authGuardMiddleware(req: any, res: any, next: Function) {
+  const authHeader = req.headers['authorization'];
+  const token = authHeader && authHeader.split(' ')[1];
+  
+  if (!token) {
+    return res.status(401).json({ error: 'Authentication token required' });
+  }
+
+  // Check real-time revocation cache
+  const isBlacklisted = await tokenBlacklist.get(\`blacklisted:\${token}\`);
+  if (isBlacklisted) {
+    return res.status(403).json({ error: 'Token has been revoked' });
+  }
+
+  try {
+    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
+    req.user = decoded;
+    next();
+  } catch (err) {
+    return res.status(403).json({ error: 'Invalid or expired session' });
+  }
+}`
        }
      ]
    },
    {
      path: "src/db/QueryStream.ts",
      status: "modified",
      additions: 38,
      deletions: 26,
      language: "typescript",
      hunks: [
        {
          header: "@@ -40,26 +40,38 @@",
          content: `-export async function fetchUserOrders(userIds: string[]) {
-  const results = [];
-  for (const id of userIds) {
-    const order = await db.query('SELECT * FROM orders WHERE user_id = ?', [id]);
-    results.push(order);
-  }
-  return results;
-}
+export async function batchFetchUserOrders(userIds: string[], chunkSize = 100) {
+  if (!userIds.length) return [];
+  
+  const chunks = [];
+  for (let i = 0; i < userIds.length; i += chunkSize) {
+    chunks.push(userIds.slice(i, i + chunkSize));
+  }

+  const promises = chunks.map(chunk => 
+    db.query('SELECT * FROM orders WHERE user_id IN (?)', [chunk])
+  );

+  const nestedResults = await Promise.all(promises);
+  return nestedResults.flat();
+}`
        }
      ]
    },
    {
      path: "test/cache.test.ts",
      status: "added",
      additions: 29,
      deletions: 0,
      language: "typescript",
      hunks: [
        {
          header: "@@ -0,0 +1,29 @@",
          content: `+import { SmartCacheManager } from '../src/cache/SmartCache';
+
+describe('SmartCacheManager', () => {
+  it('should store and retrieve values within TTL', async () => {
+    const cache = new SmartCacheManager({ maxItems: 10 });
+    cache.set('key1', 'hello world', 5);
+    const val = await cache.get('key1');
+    expect(val).toBe('hello world');
+  });

+  it('should evict LRU items when capacity is reached', async () => {
+    const cache = new SmartCacheManager({ maxItems: 2 });
+    cache.set('a', 1);
+    cache.set('b', 2);
+    cache.set('c', 3); // 'a' should be evicted
+    expect(await cache.get('a')).toBeNull();
+    expect(await cache.get('b')).toBe(2);
+  });
+});`
        }
      ]
    },
    {
      path: "package.json",
      status: "modified",
      additions: 6,
      deletions: 20,
      language: "json",
      hunks: [
        {
          header: "@@ -15,10 +15,6 @@",
          content: `   "dependencies": {
-    "lodash": "^4.17.21",
-    "moment": "^2.29.4",
+    "ioredis": "^5.3.2"
   }`
        }
      ]
    }
  ],
  dependencies: [
    { source: "src/middleware/authGuard.ts", target: "src/cache/SmartCache.ts", type: "imports" },
    { source: "src/cache/SmartCache.ts", target: "src/cache/types.ts", type: "imports" },
    { source: "test/cache.test.ts", target: "src/cache/SmartCache.ts", type: "tests" }
  ]
};
