import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PokemonCard {
  number: string;
  name: string;
  type: string;
  rarity: string;
  subseries: string[];
  generation: number;
  seriesName: string;
  obtained: boolean;
}

interface Series {
  seriesName: string;
  codename: string;
  normalCardCount: number;
  cards: PokemonCard[];
}

const PocketTCG: React.FC = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [obtainedCards, setObtainedCards] = useState<Set<string>>(new Set());
  const [collapsedSeries, setCollapsedSeries] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load obtained cards from localStorage
    const savedCards = localStorage.getItem('obtainedCards');
    if (savedCards) {
      setObtainedCards(new Set(JSON.parse(savedCards)));
    }

    // Load collapsed series state from localStorage
    const savedCollapsed = localStorage.getItem('collapsedSeries');
    if (savedCollapsed) {
      setCollapsedSeries(new Set(JSON.parse(savedCollapsed)));
    }

    // Load card data
    fetch(`${import.meta.env.BASE_URL}data/pokemons.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch pokemons.json: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        setSeries(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading pokemons.json:', error);
        setError(error.message);
        setIsLoading(false);
      });
  }, []);

  const toggleCardObtained = (cardId: string) => {
    setObtainedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      localStorage.setItem('obtainedCards', JSON.stringify([...next]));
      return next;
    });
  };

  const toggleSeriesCollapsed = (codename: string) => {
    setCollapsedSeries(prev => {
      const next = new Set(prev);
      if (next.has(codename)) {
        next.delete(codename);
      } else {
        next.add(codename);
      }
      localStorage.setItem('collapsedSeries', JSON.stringify([...next]));
      return next;
    });
  };

  const filteredSeries = series
    .map(s => ({
      ...s,
      cards: s.cards.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.number.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(s => s.cards.length > 0);

  const getSeriesObtainedCount = (s: Series) => {
    return s.cards.filter(card => obtainedCards.has(`${s.codename}-${card.number}`)).length;
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (filteredSeries.length === 0 && !searchTerm) {
    return (
      <div className="container mx-auto p-4">
        No card data available. Please check the data source.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {filteredSeries.map((s) => (
          <div key={s.codename} className="space-y-4">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-2 hover:bg-muted"
              onClick={() => toggleSeriesCollapsed(s.codename)}
            >
              <div className="flex items-center gap-4">
                <img 
                  src={`${import.meta.env.BASE_URL}images/logos/${s.seriesName.toLowerCase().replace(/ /g, '-')}.webp`}
                  alt={`${s.seriesName} logo`}
                  className="h-8"
                />
                <h2 className="text-2xl font-bold">{s.seriesName}</h2>
                <span className="text-muted-foreground">
                  ({getSeriesObtainedCount(s)} / {s.cards.length})
                </span>
              </div>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 transition-transform",
                  !collapsedSeries.has(s.codename) && "transform rotate-180"
                )} 
              />
            </Button>
            
            {!collapsedSeries.has(s.codename) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {s.cards.map((card) => {
                  const cardId = `${s.codename}-${card.number}`;
                  const isObtained = obtainedCards.has(cardId);
                  const imagePath = `${import.meta.env.BASE_URL}images/cards/${s.seriesName.toLowerCase().replace(/ /g, '-')}/${card.number}-${card.name.replace(/ /g, '-')}-${s.seriesName.replace(/ /g, '-')}.webp`;
                  
                  return (
                    <Card 
                      key={cardId}
                      className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
                        isObtained ? 'ring-2 ring-green-500 ring-offset-2' : ''
                      }`}
                      onClick={() => toggleCardObtained(cardId)}
                    >
                      <div className="relative pt-[139.4%]">
                        <img
                          src={imagePath}
                          alt={`${card.name} card`}
                          className="absolute top-0 left-0 w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-semibold">{card.name}</h3>
                            <p className="text-sm text-muted-foreground">#{card.number}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {card.type && (
                              <Badge variant="secondary">
                                {card.type}
                              </Badge>
                            )}
                            {card.rarity && (
                              <Badge variant="outline">
                                {card.rarity}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PocketTCG;