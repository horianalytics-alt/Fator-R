import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { AlertCircle, CheckCircle2, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickTaskModal } from "@/components/tasks/quick-task-modal";

import { 
  useOverdueTasks, 
  useUpcomingTasks, 
  useCompletedCount, 
  useTotalMonthTasks,
  usePendingDocsSummary,
  useActiveHoldsSummary
} from "@/hooks/use-dashboard";

import { StatusCard } from "@/components/dashboard/status-card";
import { DocsSummary } from "@/components/dashboard/docs-summary";
import { HoldsSummary } from "@/components/dashboard/holds-summary";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardIndex,
});

function GreetingHeader({ userName }: { userName: string }) {
  return (
    <div className="mb-8 space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">
        Olá, {userName}
      </h1>
      <p className="text-muted-foreground">
        Bem-vindo de volta ao seu painel.
      </p>
    </div>
  );
}

function DashboardIndex() {
  const { user } = useAuth();
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  
  const userName = user?.email ? user.email.split("@")[0] : "Usuário";

  const { data: overdueTasks, isLoading: isOverdueLoading } = useOverdueTasks();
  const { data: upcomingTasks, isLoading: isUpcomingLoading } = useUpcomingTasks();
  const { data: completedCount, isLoading: isCompletedLoading } = useCompletedCount();
  const { data: totalMonthTasks, isLoading: isTotalLoading } = useTotalMonthTasks();
  const { data: pendingDocs, isLoading: isDocsLoading } = usePendingDocsSummary();
  const { data: activeHolds, isLoading: isHoldsLoading } = useActiveHoldsSummary();

  const totalCount = totalMonthTasks || 0;
  const compCount = completedCount || 0;
  const completedText = totalCount > 0 ? `${compCount} / ${totalCount}` : `${compCount}`;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <GreetingHeader userName={userName} />
        <Button
          onClick={() => setIsQuickTaskOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2 font-medium h-10 px-4 shadow-sm w-full sm:w-auto -mt-4 sm:mt-0"
        >
          <Zap className="h-4 w-4 fill-current" />
          <span>Nova Tarefa Rápida</span>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard 
          title="Atrasadas"
          count={overdueTasks?.length || 0}
          variant="danger"
          icon={AlertCircle}
          items={overdueTasks}
          isLoading={isOverdueLoading}
        />
        <StatusCard 
          title="Vencendo (3 dias)"
          count={upcomingTasks?.length || 0}
          variant="warning"
          icon={Clock}
          items={upcomingTasks}
          isLoading={isUpcomingLoading}
        />
        <StatusCard 
          title="Concluídas no Mês"
          count={completedText}
          variant="success"
          icon={CheckCircle2}
          isLoading={isCompletedLoading || isTotalLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DocsSummary 
          count={pendingDocs?.count || 0} 
          items={pendingDocs?.items || []} 
          isLoading={isDocsLoading} 
        />
        <HoldsSummary 
          count={activeHolds?.count || 0} 
          items={activeHolds?.items || []} 
          isLoading={isHoldsLoading} 
        />
      </div>

      <QuickTaskModal 
        open={isQuickTaskOpen} 
        onOpenChange={setIsQuickTaskOpen} 
      />
    </div>
  );
}
