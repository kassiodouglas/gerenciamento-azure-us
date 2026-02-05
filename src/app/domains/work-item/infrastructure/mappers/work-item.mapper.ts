import { WorkItem } from '../../domain/entities/work-item.entity';

export class WorkItemMapper {
  static toDomain(raw: any): WorkItem {
    return new WorkItem(
      raw.id,
      raw.rev,
      raw.fields['System.Title'],
      raw.fields['System.WorkItemType'],
      raw.fields['System.State'],
      raw.fields['System.Description'],
      raw.fields['Microsoft.VSTS.Common.AcceptanceCriteria'],
      raw.relations || []
    );
  }

  static toDomainList(rawList: any[]): WorkItem[] {
    return rawList.map(item => this.toDomain(item));
  }
}
