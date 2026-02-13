import { Ticket, Search, User, Menu, Globe } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">boleta<span className="text-gradient-green">mx</span></span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#" className="text-foreground font-medium hover:text-primary transition-colors">Events</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Concerts</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Sports</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Theater</a>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <Globe className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-muted transition-colors text-sm font-medium">
              <User className="w-4 h-4" />
              Sign in
            </button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-secondary" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border px-4 py-4 bg-card space-y-3">
          <a href="#" className="block text-sm font-medium py-2">Events</a>
          <a href="#" className="block text-sm text-muted-foreground py-2">Concerts</a>
          <a href="#" className="block text-sm text-muted-foreground py-2">Sports</a>
          <a href="#" className="block text-sm text-muted-foreground py-2">Theater</a>
          <div className="h-px bg-border my-2" />
          <button className="flex items-center gap-2 text-sm font-medium py-2">
            <User className="w-4 h-4" /> Sign in
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
