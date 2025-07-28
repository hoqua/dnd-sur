import { Button } from './ui/button';

interface QuickActionsProps {
  append: (message: { role: 'user'; parts: { type: 'text'; text: string }[] }) => void;
  isLoading: boolean;
}

export function QuickActions({ append, isLoading }: QuickActionsProps) {
  const handleQuickAction = (action: string) => {
    append({
      role: 'user',
      parts: [{ type: 'text', text: action }],
    });
  };

  const quickActions = [
    {
      icon: '👁️',
      label: 'Look Around',
      action: 'I want to look around and see what is nearby.',
    },
    {
      icon: '🚶',
      label: 'Move',
      action: 'I want to move to a different location.',
    },
    {
      icon: '💬',
      label: 'Talk',
      action: 'I want to talk to someone nearby.',
    },
    {
      icon: '🎒',
      label: 'Inventory',
      action: 'I want to check my inventory and equipment.',
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 border-t border-amber-800/30 bg-amber-950/20">
      {quickActions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          onClick={() => handleQuickAction(action.action)}
          disabled={isLoading}
          className="text-xs bg-amber-900/20 border-amber-700/40 hover:bg-amber-800/30 text-amber-200 hover:text-amber-100"
        >
          <span className="mr-1">{action.icon}</span>
          {action.label}
        </Button>
      ))}
    </div>
  );
} 