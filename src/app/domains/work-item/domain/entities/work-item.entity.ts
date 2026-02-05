export class WorkItem {
  constructor(
    public readonly id: number,
    public readonly rev: number,
    public title: string,
    public type: string,
    public state: string,
    public description?: string,
    public acceptanceCriteria?: string,
    public relations: WorkItemRelation[] = []
  ) {}

  get isCompleted(): boolean {
    const completedStates = ['Closed', 'Done', 'Resolvido', 'Resolved'];
    return completedStates.includes(this.state);
  }
}

export interface WorkItemRelation {
  rel: string;
  url: string;
  attributes?: {
    isLocked: boolean;
  };
}
