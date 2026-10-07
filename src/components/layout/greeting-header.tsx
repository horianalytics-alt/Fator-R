import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GreetingHeaderProps {
  userName: string;
}

export function GreetingHeader({ userName }: GreetingHeaderProps) {
  const currentHour = new Date().getHours();
  
  let greeting = "Boa noite";
  if (currentHour >= 5 && currentHour < 12) {
    greeting = "Bom dia";
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = "Boa tarde";
  }

  const formattedDate = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {greeting}, {userName}!
      </h1>
      <p className="mt-2 text-lg text-muted-foreground capitalize-first">
        {formattedDate}
      </p>
    </header>
  );
}
