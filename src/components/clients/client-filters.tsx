import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ClientFiltersProps {
  onSearch: (search: string) => void;
  onFilterChange: (filter: string) => void;
  activeFilter: string;
}

export function ClientFilters({ onSearch, onFilterChange, activeFilter }: ClientFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar clientes..."
          className="pl-9 w-full"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      
      <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
        <ToggleGroup 
          type="single" 
          value={activeFilter} 
          onValueChange={(value) => {
            if (value) onFilterChange(value);
          }}
          className="justify-start sm:justify-end"
        >
          <ToggleGroupItem value="Todos" aria-label="Todos">
            Todos
          </ToggleGroupItem>
          <ToggleGroupItem value="Ativos" aria-label="Ativos">
            Ativos
          </ToggleGroupItem>
          <ToggleGroupItem value="Inativos" aria-label="Inativos">
            Inativos
          </ToggleGroupItem>
          <ToggleGroupItem value="Devedores" aria-label="Devedores">
            Devedores
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
