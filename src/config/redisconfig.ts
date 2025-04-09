/* eslint-disable no-undef */
import { RedisOptions } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export default redisConfig;
