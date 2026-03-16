// src/utils/request.ts
// 模拟网络延迟的工具函数
export const simulateNetwork = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));