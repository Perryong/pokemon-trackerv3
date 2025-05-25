import { useState, useEffect } from 'react';
import { useCollection } from '@/lib/collection';
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { CreditCard, LayoutGrid, Gamepad2 } from 'lucide-react';


interface NavbarProps {
  view: 'sets' | 'cards' | 'collection' | 'pocket';
  onSetSelectView: (view: 'sets' | 'cards' | 'collection' | 'pocket') => void;
}

const Navbar: React.FC<NavbarProps> = ({ view, onSetSelectView }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { getCollectionCards } = useCollection();
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
  };
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const collectionSize = getCollectionCards().length;
  
  return (
    <div className="border-b sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center max-w-7xl">
        <div className="mr-4 hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem className="mr-2">
                <Button
                  asChild
                  variant={view === 'sets' ? 'default' : 'ghost'}
                  className="transition-colors"
                  onClick={() => onSetSelectView('sets')}
                >
                  <div className="flex items-center">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Sets
                  </div>
                </Button>
              </NavigationMenuItem>
              
              <NavigationMenuItem className="mr-2">
                <Button
                  asChild
                  variant={view === 'collection' ? 'default' : 'ghost'}
                  className="transition-colors"
                  onClick={() => onSetSelectView('collection')}
                >
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    My Collection
                    {collectionSize > 0 && (
                      <Badge variant="secondary" className="ml-2">{collectionSize}</Badge>
                    )}
                  </div>
                </Button>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Button
                  asChild
                  variant={view === 'pocket' ? 'default' : 'ghost'}
                  className="transition-colors"
                  onClick={() => onSetSelectView('pocket')}
                >
                  <div className="flex items-center">
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    Pocket TCG
                  </div>
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="flex items-center justify-between flex-1 md:justify-end">
          <div className="flex items-center md:hidden">
            <Button 
              variant={view === 'sets' ? 'default' : 'ghost'}
              size="icon" 
              className="mr-2"
              onClick={() => onSetSelectView('sets')}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            
            <Button 
              variant={view === 'collection' ? 'default' : 'ghost'}
              size="icon" 
              className="relative mr-2"
              onClick={() => onSetSelectView('collection')}
            >
              <CreditCard className="h-5 w-5" />
              {collectionSize > 0 && (
                <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full">
                  {collectionSize}
                </Badge>
              )}
            </Button>

            <Button 
              variant={view === 'pocket' ? 'default' : 'ghost'}
              size="icon" 
              className="relative"
              onClick={() => onSetSelectView('pocket')}
            >
              <Gamepad2 className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-muted"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-5 w-5" />
              ) : (
                <SunIcon className="h-5 w-5" />
              )}
            </Button>
            
            <a 
              href="https://pokemontcg.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-2 hidden sm:block"
            >
              Powered by Pokémon TCG API
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;