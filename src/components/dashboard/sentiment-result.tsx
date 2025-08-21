import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SentimentResultProps {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export function SentimentResult({ sentiment, confidence }: SentimentResultProps) {
  const sentimentConfig = {
    positive: {
      label: "Positive",
      badgeClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-700",
      progressClass: "bg-green-500",
    },
    negative: {
      label: "Negative",
      badgeClass: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-700",
      progressClass: "bg-red-500",
    },
    neutral: {
      label: "Neutral",
      badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-500",
      progressClass: "bg-gray-500",
    },
  };

  const config = sentimentConfig[sentiment];

  return (
    <div className="flex flex-col items-end gap-2 text-sm">
        <div className="flex items-center gap-2">
            <span className="font-medium text-muted-foreground">Sentiment:</span>
            <Badge variant="outline" className={cn("capitalize", config.badgeClass)}>
                {config.label}
            </Badge>
        </div>
        <div className="w-28">
          <Progress value={confidence * 100} className="h-2" indicatorClassName={config.progressClass} />
          <p className="text-xs text-right text-muted-foreground mt-1">
            Confidence: {Math.round(confidence * 100)}%
          </p>
        </div>
    </div>
  );
}

// Extend Progress component to accept indicator class
const OldProgress = Progress;
const NewProgress = ({ indicatorClassName, ...props }: React.ComponentProps<typeof OldProgress> & { indicatorClassName?: string }) => (
  <OldProgress
    {...props}
    className={cn(props.className)}
    // @ts-ignore
    children={<OldProgress.Indicator className={cn(indicatorClassName)} style={{ transform: `translateX(-${100 - (props.value || 0)}%)` }} />}
  />
);

export { NewProgress as Progress };
