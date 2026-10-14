import type { AggregatedTestObject, FieldSelectionItem, DriftResolution } from '../types';
import { 
  mockTests, 
  mockRequirements, 
  mockCICDData, 
  testToRequirementMap,
  mockAutomatedCodeDefinitions,
  mockDriftAssessments,
  defaultFieldSelections
} from '../data/mockData';

// In-memory aggregated storage for runtime state
let aggregatedStorage: AggregatedTestObject[] = [];

/**
 * Extracts and maps selected fields from Jira DC, Xray, and ADO based on active configuration
 */
export const extractSelectedFields = (
  test: typeof mockTests[0],
  requirement: typeof mockRequirements[0] | null,
  cicd: typeof mockCICDData[0] | null,
  activeFields: FieldSelectionItem[] = defaultFieldSelections
): Record<string, any> => {
  const extracted: Record<string, any> = {};

  activeFields
    .filter(f => f.isSelected)
    .forEach(field => {
      switch (field.id) {
        case 'jira_summary':
          extracted['summary'] = test.summary;
          break;
        case 'jira_description':
          extracted['description'] = test.description;
          break;
        case 'jira_priority':
          extracted['priority'] = test.priority;
          break;
        case 'jira_components':
          extracted['components'] = test.components || requirement?.components || [];
          break;
        case 'jira_fixVersions':
          extracted['fixVersions'] = test.fixVersions || requirement?.fixVersions || [];
          break;
        case 'jira_customfield_10014':
          extracted['epicLink'] = test.customFields?.customfield_10014 || requirement?.customFields?.customfield_10014 || null;
          break;
        case 'jira_customfield_10020':
          extracted['acceptanceCriteria'] = test.customFields?.customfield_10020 || requirement?.customFields?.customfield_10020 || null;
          break;
        case 'xray_steps':
          extracted['xrayStepsCount'] = test.xraySteps ? test.xraySteps.length : test.steps.length;
          break;
        case 'xray_last_modified':
          extracted['lastXrayModified'] = test.lastXrayModified || null;
          break;
        case 'ado_pipeline_run':
          extracted['adoPipelineRun'] = cicd?.pipelineRun || null;
          break;
        case 'ado_agent_pool':
          extracted['adoAgentPool'] = cicd?.agentPool || null;
          break;
        case 'ado_duration':
          extracted['durationSeconds'] = cicd?.durationSeconds || null;
          break;
        case 'ado_artifacts':
          extracted['artifactCount'] = cicd?.artifactReferences?.length || 0;
          break;
        default:
          break;
      }
    });

  return extracted;
};

/**
 * Ingestion and Aggregation Engine
 * Merges Jira DC Requirements, Xray DC Tests, Git Test Repo Automated Code, and Azure DevOps Runs
 */
export const runAggregationEngine = async (
  activeFieldSelections: FieldSelectionItem[] = defaultFieldSelections
): Promise<AggregatedTestObject[]> => {
  // Simulate network round-trip to Jira DC, Xray DC Raven API, and Azure DevOps REST APIs
  await new Promise(resolve => setTimeout(resolve, 1400));
  
  const results: AggregatedTestObject[] = mockTests.map((test) => {
    const reqId = testToRequirementMap[test.id];
    const requirement = mockRequirements.find(r => r.requirementId === reqId) || null;
    const cicd = mockCICDData.find(c => c.testId === test.id) || null;
    const codeDefinition = mockAutomatedCodeDefinitions[test.id] || null;
    const drift = mockDriftAssessments[test.id] || (test.isAutomated === false ? {
      status: 'code_missing',
      severity: 'medium',
      hasDrift: true,
      summary: 'Manual test in Xray without automated test in codebase',
      items: [],
      lastAssessedAt: new Date().toISOString()
    } : {
      status: 'in_sync',
      severity: 'none',
      hasDrift: false,
      summary: 'Automated test in git matches Xray definition',
      items: [],
      lastAssessedAt: new Date().toISOString()
    });

    const selectedFields = extractSelectedFields(test, requirement, cicd, activeFieldSelections);

    return {
      test,
      requirement,
      cicd,
      codeDefinition,
      drift,
      selectedFields
    };
  });
  
  aggregatedStorage = results;
  return results;
};

/**
 * Apply a human resolution to a drifted test
 */
export const applyDriftResolution = (
  testId: string, 
  resolution: DriftResolution
): AggregatedTestObject[] => {
  aggregatedStorage = aggregatedStorage.map(item => {
    if (item.test.id === testId && item.drift) {
      return {
        ...item,
        drift: {
          ...item.drift,
          hasDrift: resolution.status === 'resolved_acknowledged' ? item.drift.hasDrift : false,
          status: resolution.status === 'resolved_acknowledged' ? item.drift.status : 'in_sync',
          resolution
        }
      };
    }
    return item;
  });

  return aggregatedStorage;
};

export const getAggregatedData = (): AggregatedTestObject[] => {
  return aggregatedStorage;
};

export const clearAggregatedData = () => {
  aggregatedStorage = [];
};
