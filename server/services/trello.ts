import type { Task } from '@shared/schema';

const TRELLO_API_BASE = 'https://api.trello.com/1';

interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  due: string | null;
  dueComplete: boolean;
  idList: string;
  idBoard: string;
  url: string;
  labels: Array<{ id: string; name: string; color: string }>;
}

interface TrelloBoard {
  id: string;
  name: string;
  desc: string;
  url: string;
  closed?: boolean;
}

interface TrelloList {
  id: string;
  name: string;
  idBoard: string;
}

function getTrelloAuth(): { key: string; token: string } {
  const key = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_TOKEN;

  if (!key || !token) {
    throw new Error('Trello API credentials not configured');
  }

  return { key, token };
}

function buildAuthUrl(endpoint: string): string {
  const { key, token } = getTrelloAuth();
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${TRELLO_API_BASE}${endpoint}${separator}key=${key}&token=${token}`;
}

export async function fetchTrelloBoards(): Promise<TrelloBoard[]> {
  const url = buildAuthUrl('/members/me/boards');
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Trello API error: ${response.statusText}`);
  }

  const boards: TrelloBoard[] = await response.json();
  
  // Filter out closed/archived boards to prevent errors when creating cards
  return boards.filter(board => !board.closed);
}

export async function fetchBoardLists(boardId: string): Promise<TrelloList[]> {
  const url = buildAuthUrl(`/boards/${boardId}/lists`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Trello API error: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchTrelloCards(boardId?: string, listId?: string): Promise<TrelloCard[]> {
  let url: string;
  
  if (listId) {
    // Fetch cards from a specific list
    url = buildAuthUrl(`/lists/${listId}/cards`);
  } else if (boardId) {
    // Fetch cards from a specific board
    url = buildAuthUrl(`/boards/${boardId}/cards`);
  } else {
    // Get all cards from all boards
    const boards = await fetchTrelloBoards();
    const allCards: TrelloCard[] = [];
    
    for (const board of boards) {
      const boardUrl = buildAuthUrl(`/boards/${board.id}/cards`);
      const response = await fetch(boardUrl);
      
      if (response.ok) {
        const cards = await response.json();
        allCards.push(...cards);
      }
    }
    
    return allCards;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Trello API error: ${response.statusText}`);
  }

  return response.json();
}

export async function createTrelloCard(params: {
  listId: string;
  name: string;
  desc?: string;
  due?: string;
  labels?: string[];
}): Promise<TrelloCard> {
  const { key, token } = getTrelloAuth();
  
  const searchParams = new URLSearchParams({
    key,
    token,
    idList: params.listId,
    name: params.name,
  });

  if (params.desc) {
    searchParams.append('desc', params.desc);
  }

  if (params.due) {
    searchParams.append('due', params.due);
  }

  if (params.labels && params.labels.length > 0) {
    searchParams.append('idLabels', params.labels.join(','));
  }

  const url = `${TRELLO_API_BASE}/cards?${searchParams.toString()}`;
  console.log('[DEBUG] Trello API Request URL:', url.replace(/key=[^&]+/, 'key=REDACTED').replace(/token=[^&]+/, 'token=REDACTED'));
  console.log('[DEBUG] Trello API Request params:', {
    idList: params.listId,
    name: params.name,
    desc: params.desc,
    due: params.due,
  });
  
  const response = await fetch(url, { method: 'POST' });

  if (!response.ok) {
    const errorBody = await response.text();
    console.log('[DEBUG] Trello API Error Status:', response.status);
    console.log('[DEBUG] Trello API Error Body:', errorBody);
    throw new Error(`Trello API error: ${response.statusText} - ${errorBody}`);
  }

  return response.json();
}

export async function updateTrelloCard(
  cardId: string,
  updates: {
    name?: string;
    desc?: string;
    due?: string;
    dueComplete?: boolean;
    idList?: string;
  }
): Promise<TrelloCard> {
  const { key, token } = getTrelloAuth();
  
  const searchParams = new URLSearchParams({ key, token });

  if (updates.name) searchParams.append('name', updates.name);
  if (updates.desc !== undefined) searchParams.append('desc', updates.desc);
  if (updates.due !== undefined) searchParams.append('due', updates.due);
  if (updates.dueComplete !== undefined) searchParams.append('dueComplete', String(updates.dueComplete));
  if (updates.idList) searchParams.append('idList', updates.idList);

  const url = `${TRELLO_API_BASE}/cards/${cardId}?${searchParams.toString()}`;
  const response = await fetch(url, { method: 'PUT' });

  if (!response.ok) {
    throw new Error(`Trello API error: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteTrelloCard(cardId: string): Promise<void> {
  const url = buildAuthUrl(`/cards/${cardId}`);
  const response = await fetch(url, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(`Trello API error: ${response.statusText}`);
  }
}

// Convert Trello card to our Task format (excluding id to avoid conflicts)
export function trelloCardToTask(card: TrelloCard): Omit<Task, 'userId' | 'createdAt' | 'id'> {
  return {
    title: card.name,
    dueAt: card.due ? new Date(card.due) : null,
    status: card.dueComplete ? 'completed' : 'pending',
    source: 'trello',
    metadataJson: {
      trelloId: card.id,
      boardId: card.idBoard,
      listId: card.idList,
      url: card.url,
      description: card.desc || '',
      labels: card.labels,
    } as any,
  };
}

// Find the default list for new tasks (typically "To Do" or first list)
export async function getDefaultListId(boardId?: string): Promise<string> {
  let targetBoardId = boardId;
  
  if (!targetBoardId) {
    // Get the first board
    const boards = await fetchTrelloBoards();
    if (boards.length === 0) {
      throw new Error('No Trello boards found');
    }
    targetBoardId = boards[0].id;
  }

  const lists = await fetchBoardLists(targetBoardId);
  
  if (lists.length === 0) {
    throw new Error('No lists found on board');
  }

  // Try to find "To Do" or "Backlog" list
  const todoList = lists.find(list => 
    list.name.toLowerCase().includes('to do') || 
    list.name.toLowerCase().includes('todo') ||
    list.name.toLowerCase().includes('backlog')
  );

  return todoList ? todoList.id : lists[0].id;
}
