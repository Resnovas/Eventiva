import { describe, it, expect } from 'vitest';
import { ScheduleItem } from '../types/event';

describe('ScheduleEditor Component Logic', () => {
  const initialSchedule: ScheduleItem[] = [
    {
      id: 'sch-1',
      eventId: 'evt-1',
      title: 'Opening Remarks',
      startTime: '2026-10-15T09:00:00Z',
      endTime: '2026-10-15T09:30:00Z',
      orderIndex: 0,
      category: 'keynote',
    },
    {
      id: 'sch-2',
      eventId: 'evt-1',
      title: 'Technical Session',
      startTime: '2026-10-15T09:30:00Z',
      endTime: '2026-10-15T11:00:00Z',
      orderIndex: 1,
      category: 'workshop',
    },
  ];

  it('schedule items have correct order', () => {
    expect(initialSchedule[0].orderIndex).toBe(0);
    expect(initialSchedule[1].orderIndex).toBe(1);
  });

  it('move up swaps order indices correctly', () => {
    const items = [...initialSchedule];
    const index = 1;
    const targetIndex = index - 1;
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    const reindexed = items.map((item, idx) => ({
      ...item,
      orderIndex: idx,
    }));

    expect(reindexed[0].id).toBe('sch-2');
    expect(reindexed[1].id).toBe('sch-1');
    expect(reindexed[0].orderIndex).toBe(0);
    expect(reindexed[1].orderIndex).toBe(1);
  });

  it('delete removes item and reindexes', () => {
    const items = initialSchedule.filter((it) => it.id !== 'sch-1');
    const reindexed = items.map((item, idx) => ({
      ...item,
      orderIndex: idx,
    }));
    expect(reindexed).toHaveLength(1);
    expect(reindexed[0].orderIndex).toBe(0);
  });
});