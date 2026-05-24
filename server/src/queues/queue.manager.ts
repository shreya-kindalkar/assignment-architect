import { Queue } from "bullmq";
import { isRedisAvailable, redisClient } from "../config/redis.js";
import { EventEmitter } from "events";

// Custom Mock Local Queue using Node Events for Zero-Dependency fallback
export class MockQueue extends EventEmitter {
  public name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  async add(jobName: string, data: any, opts?: any): Promise<any> {
    const jobId = `mock_job_${Math.random().toString(36).substring(2, 9)}`;
    console.log(`[Mock Queue: ${this.name}] Enqueued job "${jobName}" (ID: ${jobId})`);
    
    // Process job in the next cycle to simulate asynchronous queuing
    setImmediate(() => {
      this.emit("process_job", {
        id: jobId,
        name: jobName,
        data,
        attemptsMade: 1,
        updateProgress: async (progressValue: number) => {
          console.log(`[Mock Queue: ${this.name}] Job ${jobId} progress: ${progressValue}%`);
        }
      });
    });

    return { id: jobId, name: jobName, data };
  }
}

const initializedQueues = new Map<string, any>();

export const QueueManager = {
  getQueue(queueName: "generationQueue" | "pdfQueue"): any {
    if (initializedQueues.has(queueName)) {
      return initializedQueues.get(queueName);
    }

    let queueInstance: any;

    if (isRedisAvailable && redisClient) {
      console.log(`[Queue Manager] Initializing production BullMQ Queue: "${queueName}"`);
      queueInstance = new Queue(queueName, {
        connection: redisClient,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: "exponential", delay: 1000 },
          removeOnComplete: true,
          removeOnFail: false
        }
      });
    } else {
      console.log(`[Queue Manager] Initializing resilient Event Mock Queue: "${queueName}"`);
      queueInstance = new MockQueue(queueName);
    }

    initializedQueues.set(queueName, queueInstance);
    return queueInstance;
  },

  async addJob(queueName: "generationQueue" | "pdfQueue", jobName: string, data: any): Promise<any> {
    const queue = this.getQueue(queueName);
    return await queue.add(jobName, data);
  }
};
