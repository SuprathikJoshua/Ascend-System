export interface DsaPhasePlan {
  label: string;
  startWeek: number;
  endWeek: number;
  topics: string[];
}

export const DSA_PHASE_PLAN: DsaPhasePlan[] = [
  { label: 'W1', startWeek: 1, endWeek: 1, topics: ['Beginner Problems', 'Sorting', 'Hashing', 'Strings Basic'] },
  { label: 'W2-3', startWeek: 2, endWeek: 3, topics: ['Arrays', 'Binary Search'] },
  { label: 'W4', startWeek: 4, endWeek: 4, topics: ['Recursion', 'Bit Manipulation'] },
  { label: 'W5-6', startWeek: 5, endWeek: 6, topics: ['Linked-List'] },
  { label: 'W7-8', startWeek: 7, endWeek: 8, topics: ['Stack-Queues', 'Sliding Window', 'Graphs'] },
  { label: 'W9', startWeek: 9, endWeek: 9, topics: ['Heaps', 'Greedy'] },
  { label: 'W10-11', startWeek: 10, endWeek: 11, topics: ['Binary Trees', 'BST'] },
  { label: 'W12-15', startWeek: 12, endWeek: 15, topics: ['DP'] },
  { label: 'W16', startWeek: 16, endWeek: 16, topics: ['Tries', 'Strings Advanced', 'Maths'] },
  { label: 'W17-18', startWeek: 17, endWeek: 18, topics: [] },
];

export const GRAPH_LEFTOVERS = [
  'Traversal Problems',
  'Cycles',
  'Shortest Path Algorithms',
  'Shortest Path Algorithms',
  'Shortest Path Algorithms',
  'Shortest Path Algorithms',
  'Hard Problems II',
];

export const GRAPH_REVISION_ITEMS = [
  'BFS/DFS on grid',
  'Cycle detection undirected',
  'Cycle detection directed',
  'Topo sort (DFS)',
  'Topo sort (Kahn)',
  'Dijkstra',
  'Bellman-Ford',
  'Floyd-Warshall',
  'DSU',
  'Kruskal',
  'Prim',
  'Bridges',
  'Articulation points',
  'SCC (Kosaraju)',
  'Bipartite check',
  'Shortest path in DAG',
  'Word Ladder',
  'Number of provinces',
  'Multi-source BFS (Rotten Oranges)',
  'Cheapest flights within K stops',
];

export const DSA_TOPIC_ORDER = DSA_PHASE_PLAN.flatMap(phase => phase.topics);

export function dsaTopicPhase(name: string): string {
  return DSA_PHASE_PLAN.find(phase => phase.topics.includes(name))?.label ?? '';
}

export function currentDsaWeek(startIso: string, date = new Date()): number {
  const start = new Date(`${startIso}T00:00:00`);
  if (Number.isNaN(start.getTime())) return 1;
  const todayUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  return Math.floor((todayUtc - startUtc) / 86_400_000) + 1;
}

export function dsaWeekKey(startIso: string, date = new Date()): string {
  return `${startIso}:W${currentDsaWeek(startIso, date)}`;
}
