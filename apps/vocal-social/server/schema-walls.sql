-- Text walls and the shared newsfeed. Apply once, after schema.sql:
-- npx wrangler d1 execute cb-vocal-social --remote --file=apps/vocal-social/server/schema-walls.sql
CREATE TABLE IF NOT EXISTS wall_posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  wall_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  text TEXT NOT NULL,
  created INTEGER NOT NULL,
  comments INTEGER DEFAULT 0,
  hidden INTEGER DEFAULT 0,
  reports INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS wall_posts_feed ON wall_posts(channel, hidden, created DESC);
CREATE INDEX IF NOT EXISTS wall_posts_wall ON wall_posts(wall_id, channel, created DESC);
CREATE TABLE IF NOT EXISTS wall_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created INTEGER NOT NULL,
  hidden INTEGER DEFAULT 0,
  reports INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS wall_comments_post ON wall_comments(post_id, created);
