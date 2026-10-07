import { Home, Users, Calendar, ShieldAlert, ClipboardList } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Tarefas", url: "/tarefas", icon: ClipboardList },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Calendário", url: "/calendario", icon: Calendar },
  { title: "Retenções", url: "/retencoes", icon: ShieldAlert },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t border-border bg-background pb-safe">
      {mobileNavItems.map((item) => {
        const isActive = location.pathname === item.url;
        return (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 flex-1 text-xs font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn("mb-1 h-5 w-5", isActive && "fill-primary/20")} />
            <span className="truncate w-full text-center">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
