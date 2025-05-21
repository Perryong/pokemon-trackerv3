import { useState, useEffect } from 'react';

const API_KEY = '31138e72-dced-469e-9b59-ae3b155ac955';
const BASE_URL = 'https://api.pokemontcg.io/v2';

export interface PokemonSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities: {
    standard?: string;
    expanded?: string;
    unlimited?: string;
  };
  releaseDate: string;
  images: {
    symbol: string;
    logo: string;
  };
}

export interface CardImage {
  small: string;
  large: string;
}

export interface CardPrice {
  market: number | null;
}

export interface CardPrices {
  holofoil?: CardPrice;
  reverseHolofoil?: CardPrice;
  normal?: CardPrice;
  [key: string]: CardPrice | undefined;
}

export interface Attack {
  name: string;
  cost: string[];
  damage: string;
  text: string;
}

export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  hp?: string;
  types?: string[];
  rules?: string[];
  attacks?: Attack[];
  weaknesses?: {
    type: string;
    value: string;
  }[];
  resistances?: {
    type: string;
    value: string;
  }[];
  set: PokemonSet;
  number: string;
  artist?: string;
  rarity?: string;
  legalities: {
    standard?: string;
    expanded?: string;
    unlimited?: string;
  };
  images: CardImage;
  tcgplayer?: {
    url: string;
    prices: CardPrices;
  };
}

export interface CollectionCard extends PokemonCard {
  quantity: number;
  condition: string;
  purchasePrice?: number;
  notes?: string;
}

const fetchFromApi = async (endpoint: string, params: Record<string, string> = {}): Promise<any> => {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });
  
  const response = await fetch(url.toString(), {
    headers: { 'X-Api-Key': API_KEY }
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
};

export const useSets = (page: number, pageSize: number, filters: Record<string, string> = {}) => {
  const [sets, setSets] = useState<PokemonSet[]>([]);
  const [totalSets, setTotalSets] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSets = async () => {
      setLoading(true);
      try {
        const params = {
          page: page.toString(),
          pageSize: pageSize.toString(),
          orderBy: 'releaseDate',
          ...filters,
        };
        const response = await fetchFromApi('sets', params);
        setSets(response.data);
        setTotalSets(response.totalCount);
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSets();
  }, [page, pageSize, JSON.stringify(filters)]);
  
  return { sets, totalSets, loading, error };
};

export const useCards = (setId: string | null, page: number, pageSize: number, filters: Record<string, string> = {}) => {
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [totalCards, setTotalCards] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!setId) {
      setCards([]);
      setTotalCards(0);
      return;
    }
    
    const fetchCards = async () => {
      setLoading(true);
      try {
        const queryParts = [`set.id:"${setId}"`];
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            const filterValue = value.includes(' ') ? `"${value}"` : value;
            queryParts.push(`${key}:${filterValue}`);
          }
        });
        
        const params = {
          page: page.toString(),
          pageSize: pageSize.toString(),
          q: queryParts.join(' '),
          orderBy: 'number',
        };
        
        const response = await fetchFromApi('cards', params);
        setCards(response.data);
        setTotalCards(response.totalCount);
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCards();
  }, [setId, page, pageSize, JSON.stringify(filters)]);
  
  return { cards, totalCards, loading, error };
};

export const useCard = (cardId: string | null) => {
  const [card, setCard] = useState<PokemonCard | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!cardId) {
      setCard(null);
      return;
    }
    
    const fetchCard = async () => {
      setLoading(true);
      try {
        const response = await fetchFromApi(`cards/${cardId}`);
        setCard(response.data);
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCard();
  }, [cardId]);
  
  return { card, loading, error };
};