import { Radar } from "lucide-react";

const DetectingStep = ({ symbol, confirmations, required, title = "Payment detected", subtitle, unit = "confirmations" }: {
  symbol?: string; confirmations: number; required: number;
  title?: string; subtitle?: string; unit?: string;
}) => (
  <div className="animate-fade-in-up text-center py-10">
    <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
      <Radar className="w-9 h-9 text-primary animate-pulse-slow" />
    </div>
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className="text-sm text-muted-foreground mb-8">{subtitle ?? `Confirming your ${symbol} transaction on the network…`}</p>
    <div className="w-full h-2.5 rounded-full bg-secondary mb-3 overflow-hidden">
      <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${(confirmations / required) * 100}%` }} />
    </div>
    <span className="text-xs text-muted-foreground font-mono">{confirmations}/{required} {unit}</span>
  </div>
);

export default DetectingStep;
