import crypto from 'crypto';

class UniqueIdGenerator {
  private static instance: UniqueIdGenerator;
  private counter: number = 0;
  private lastTimestamp: number = 0;

  private constructor() {}

  public static getInstance(): UniqueIdGenerator {
    if (!UniqueIdGenerator.instance) {
      UniqueIdGenerator.instance = new UniqueIdGenerator();
    }
    return UniqueIdGenerator.instance;
  }

  /**
   * Generates a UUID v4
   */
  public generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Generates a time-based ID with counter to handle multiple IDs in same millisecond
   * Format: timestamp-counter-random
   */
  public generateTimeBasedId(): string {
    const timestamp = Date.now();

    if (timestamp === this.lastTimestamp) {
      this.counter++;
    } else {
      this.counter = 0;
      this.lastTimestamp = timestamp;
    }

    const random = crypto.randomBytes(2).toString('hex');
    return `${timestamp}-${this.counter}-${random}`;
  }

  /**
   * Generates a short unique ID using custom alphabet
   * Good for user-friendly IDs
   */
  public generateShortId(length: number = 8): string {
    const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const bytes = crypto.randomBytes(length);
    let id = '';

    for (let i = 0; i < length; i++) {
      id += alphabet[bytes[i] % alphabet.length];
    }

    return id;
  }

  /**
   * Generates a Snowflake-like ID (similar to Discord/Twitter)
   * 64-bit IDs: timestamp(42 bits) + worker(10 bits) + sequence(12 bits)
   */
  public generateSnowflakeId(workerId: number = 1): string {
    const timestamp = BigInt(Date.now() - 1609459200000); // Custom epoch (2021-01-01)
    const sequence = BigInt(this.counter++ % 4096);

    // Ensure workerId is within valid range (0-1023)
    workerId = workerId % 1024;

    const id = (timestamp << 22n) | (BigInt(workerId) << 12n) | sequence;
    return id.toString();
  }

  /**
   * Generates a namespaced unique ID
   * Useful for specific game entities
   */
  public generateNamespacedId(namespace: string, length: number = 16): string {
    const random = crypto.randomBytes(length / 2).toString('hex');
    return `${namespace}-${random}`;
  }

  /**
   * Verify if a string is a valid UUID
   */
  public isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

// // Example usage:
// const idGenerator = UniqueIdGenerator.getInstance();

// // Different ways to generate IDs based on your needs:
// const uuid = idGenerator.generateUUID();                    // e.g., "123e4567-e89b-12d3-a456-426614174000"
// const timeId = idGenerator.generateTimeBasedId();          // e.g., "1676887234567-0-a1b2"
// const shortId = idGenerator.generateShortId();             // e.g., "xK2bPq8Z"
// const snowflakeId = idGenerator.generateSnowflakeId(1);    // e.g., "825098358944292864"
// const gameId = idGenerator.generateNamespacedId('game');   // e.g., "game-a1b2c3d4e5f6"
// const playerId = idGenerator.generateNamespacedId('player'); // e.g., "player-f1e2d3c4b5a6"

export default UniqueIdGenerator;