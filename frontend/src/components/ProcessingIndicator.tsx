import { Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProcessingStep {
  label: string;
  status: 'pending' | 'processing' | 'complete';
}

interface ProcessingIndicatorProps {
  steps: ProcessingStep[];
}

export default function ProcessingIndicator({ steps }: ProcessingIndicatorProps) {
  return (
    <Card className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-medium mb-4" data-testid="text-processing-title">Processing Document</h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3" data-testid={`step-${index}`}>
            <div className="flex-shrink-0">
              {step.status === 'complete' && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              {step.status === 'processing' && (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              )}
              {step.status === 'pending' && (
                <div className="w-6 h-6 rounded-full border-2 border-muted" />
              )}
            </div>
            <span className={`text-sm ${step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
