import { AppSidebar } from "./app-sidebar";
import { MobileNav } from "./mobile-nav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { Settings } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
        <AppSidebar />
        
        {/* Mobile Header with Settings Icon */}
        <header className="md:hidden flex h-14 items-center justify-between border-b border-border bg-background px-4 sticky top-0 z-40">
          <h2 className="text-lg font-bold tracking-tight">Painel Contábil</h2>
          <Link 
            to="/configuracoes" 
            className="flex items-center justify-center min-w-[44px] min-h-[44px] text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Configurações</span>
          </Link>
        </header>

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden pb-20 md:pb-0">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
            {children}
          </div>
        </main>
        
        <MobileNav />
        <Toaster position="top-right" closeButton richColors />
      </div>
    </SidebarProvider>
  );
}
