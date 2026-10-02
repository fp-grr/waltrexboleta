import { Clock, RefreshCw } from "lucide-react";

const QuoteExpired = ({ onRefresh }: { onRefresh: () => void }) => (
  <div className="animate-fade-in-up text-center py-8">
    <div className="w-20 h-20 rounded-full bg-destructive/10 mx-auto mb-6 flex items-center justify-center">
      <Clock className="w-9 h-9 text-destructive" />
    </div>
    <h3 className="text-xl font-semibold mb-2">Quote expired</h3>
    <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
      Rates move, so quotes are only held for a few minutes. Please do not send a transfer based on the previous quote.
    </p>
    <button onClick={onRefresh} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
      <RefreshCw className="w-4 h-4" /> Get new quote
    </button>
  </div>
);

export default QuoteExpired;
