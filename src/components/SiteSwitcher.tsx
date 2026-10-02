import { Link, useLocation } from "react-router-dom";

const SiteSwitcher = () => {
  const onBroker = useLocation().pathname.startsWith("/broker");
  const base = "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors";
  return (
    <div className="flex items-center p-1 rounded-full bg-secondary border border-border">
      <Link to="/" className={`${base} ${!onBroker ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>BoletaMX</Link>
      <Link to="/broker" className={`${base} ${onBroker ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>TopBroker</Link>
    </div>
  );
};

export default SiteSwitcher;
