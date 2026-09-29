import * as SQLite from "expo-sqlite";

let dbPromise: Promise<SQLite.SQLiteDatabase | null> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        if (!SQLite || typeof SQLite.openDatabaseAsync !== "function") {
          console.warn("expo-sqlite não está disponível no build nativo atual.");
          return null;
        }
        const db = await SQLite.openDatabaseAsync("rotacric.db");
        await db.execAsync(`
          PRAGMA journal_mode = WAL;
          PRAGMA busy_timeout = 10000;
          
          CREATE TABLE IF NOT EXISTS cities (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            about TEXT,
            lat REAL NOT NULL DEFAULT 0,
            lng REAL NOT NULL DEFAULT 0,
            zoom INTEGER NOT NULL DEFAULT 12,
            banner_image TEXT,
            visible INTEGER NOT NULL DEFAULT 1,
            active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT,
            updated_at TEXT
          );

          CREATE TABLE IF NOT EXISTS routes (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            polyline TEXT NOT NULL,
            strava_id TEXT,
            color TEXT,
            distance REAL NOT NULL DEFAULT 0,
            is_event_route INTEGER NOT NULL DEFAULT 0,
            active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT,
            updated_at TEXT
          );

          CREATE TABLE IF NOT EXISTS anchor_points (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            lat REAL NOT NULL DEFAULT 0,
            lng REAL NOT NULL DEFAULT 0,
            business_hours TEXT,
            phone TEXT,
            image TEXT,
            active INTEGER NOT NULL DEFAULT 1,
            on_route INTEGER NOT NULL DEFAULT 1,
            category_id TEXT,
            city_id TEXT,
            category_icon_name TEXT,
            category_name TEXT,
            created_at TEXT,
            updated_at TEXT
          );

          CREATE TABLE IF NOT EXISTS stamps (
            id TEXT PRIMARY KEY,
            anchor_point_id TEXT NOT NULL,
            qr_code_token TEXT NOT NULL,
            name TEXT NOT NULL,
            badge_image TEXT,
            active INTEGER NOT NULL DEFAULT 1,
            collected INTEGER NOT NULL DEFAULT 0,
            scanned_at TEXT
          );

          CREATE TABLE IF NOT EXISTS pending_sync_queue (
            id TEXT PRIMARY KEY,
            action_type TEXT NOT NULL,
            payload TEXT NOT NULL,
            created_at TEXT NOT NULL,
            status TEXT DEFAULT 'pending'
          );

          CREATE TABLE IF NOT EXISTS city_images (
            id TEXT PRIMARY KEY,
            city_id TEXT NOT NULL,
            url TEXT NOT NULL,
            caption TEXT,
            order_index INTEGER NOT NULL DEFAULT 0,
            created_at TEXT
          );

          CREATE TABLE IF NOT EXISTS weather_cache (
            key TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            updated_at INTEGER NOT NULL
          );

          CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'info',
            data TEXT,
            read INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'delivered'
          );

          CREATE INDEX IF NOT EXISTS idx_anchor_points_coords ON anchor_points(lat, lng);
          CREATE INDEX IF NOT EXISTS idx_anchor_points_cat_city ON anchor_points(category_id, city_id, active);
          CREATE INDEX IF NOT EXISTS idx_routes_active ON routes(active, is_event_route);
          CREATE INDEX IF NOT EXISTS idx_stamps_anchor ON stamps(anchor_point_id, active);
          CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
          CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
        `);

        // Migration para garantir coluna 'data' se a tabela já existia com schema antigo
        try {
          await db.execAsync(`ALTER TABLE weather_cache ADD COLUMN data TEXT;`);
        } catch {
          // Coluna data já existe
        }

        return db;
      } catch (e) {
        console.error("Erro ao inicializar banco de dados SQLite:", e);
        return null;
      }
    })();
  }
  return dbPromise;
}

class AsyncMutex {
  private queue: Promise<any> = Promise.resolve();

  async runExclusive<T>(task: () => Promise<T>): Promise<T> {
    const res = this.queue.then(
      () => task(),
      () => task()
    );
    this.queue = res.catch(() => {});
    return res;
  }
}

export const dbMutex = new AsyncMutex();

export async function runReadOnly<T>(fn: () => Promise<T>): Promise<T> {
  return dbMutex.runExclusive(async () => {
    return await fn();
  });
}

export async function runWithTransaction<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  initialDelayMs = 150
): Promise<T> {
  return dbMutex.runExclusive(async () => {
    const db = await getDatabase();
    if (!db) return fn();

    let lastError: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const dbAny = db as any;
        if (typeof dbAny.withExclusiveTransactionAsync === "function") {
          return await dbAny.withExclusiveTransactionAsync(async () => {
            return await fn();
          });
        } else if (typeof dbAny.withTransactionAsync === "function") {
          return await dbAny.withTransactionAsync(async () => {
            return await fn();
          });
        } else {
          let inTx = false;
          try {
            await db.execAsync("BEGIN IMMEDIATE;");
            inTx = true;
            const res = await fn();
            await db.execAsync("COMMIT;");
            return res;
          } catch (txErr) {
            if (inTx) {
              try {
                await db.execAsync("ROLLBACK;");
              } catch {}
            }
            throw txErr;
          }
        }
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err || "");
        const isLocked =
          errStr.includes("database is locked") ||
          errStr.includes("finalizeAsync") ||
          errStr.includes("SQLITE_BUSY") ||
          errStr.includes("cannot start a transaction") ||
          errStr.includes("within a transaction");

        if (isLocked && attempt < maxRetries) {
          const delay = initialDelayMs * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw err;
      }
    }
    throw lastError;
  });
}



