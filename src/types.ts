export interface AzureConfig {
  organization: string;
  project: string;
  pat: string;
  devEmail: string;
  isDemoMode: boolean;
}

export interface WorkItem {
  id: number;
  rev: number;
  fields: {
    'System.Title': string;
    'System.WorkItemType': string;
    'System.State': string;
    'System.Description'?: string;
    'Microsoft.VSTS.Common.AcceptanceCriteria'?: string;
    [key: string]: any;
  };
  relations?: WorkItemRelation[];
}

export interface WorkItemRelation {
  rel: string;
  url: string;
  attributes?: {
    isLocked: boolean;
  };
}

export interface WiqlResponse {
  queryType: string;
  queryResultType: string;
  workItems: { id: number; url: string }[];
}

export interface GeneratedTask {
  title: string;
  description: string;
  activity?: string;
}
