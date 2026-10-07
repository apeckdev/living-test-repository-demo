import type { AggregatedTestObject } from '../types';
import { mockTests, mockRequirements, mockCICDData, testToRequirementMap } from '../data/mockData';

// Simulated database
let aggregatedStorage: AggregatedTestObject[] = [];

export const runAggregationEngine = async (): Promise<AggregatedTestObject[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const results: AggregatedTestObject[] = mockTests.map((test) => {
    const reqId = testToRequirementMap[test.id];
    const requirement = mockRequirements.find(r => r.requirementId === reqId) || null;
    const cicd = mockCICDData.find(c => c.testId === test.id) || null;
    
    return {
      test,
      requirement,
      cicd
    };
  });
  
  aggregatedStorage = results;
  return results;
};

export const getAggregatedData = (): AggregatedTestObject[] => {
  return aggregatedStorage;
};

export const clearAggregatedData = () => {
  aggregatedStorage = [];
};
