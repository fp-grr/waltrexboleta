import { useState } from "react";
import { Calendar, MapPin, Clock, Star, Users, Share2, Heart, ChevronDown, Info, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import CheckoutDrawer from "../components/CheckoutDrawer";
import eventHero from "@/assets/event-hero.jpg";
import venuePhoto from "@/assets/venue-photo.jpg";

const TICKET_TIERS = [
  { id: "ga", label: "General Admission", price: 1850, description: "Standing area · Full festival access", available: true },
  { id: "vip", label: "VIP Experience", price: 4200, description: "VIP lounge · Premium viewing · Open bar", available: true },
  { id: "platinum", label: "Platinum", price: 8500, description: "Front row · Meet & greet · All-inclusive", available: false },
];

const LINEUP = [
  { name: "DJ Orbital", time: "9:00 PM", stage: "Main Stage" },
  { name: "Neon Pulse", time: "10:30 PM", stage: "Main Stage" },
  { name: "Sombra Collective", time: "11:45 PM", stage: "Arena Stage" },
  { name: "Midnight Sun", time: "1:00 AM", stage: "Main Stage" },
];

const EventPage = () => {
  const [selectedTier, setSelectedTier] = useState(TICKET_TIERS[0]);
  const [quantity, setQuantity] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img src={eventHero} alt="Neon Nights Festival" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider">On sale</span>
            <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">Festival</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2">Neon Nights Festival 2026</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">The biggest electronic music festival in Latin America returns to Mexico City</p>
        </div>
      </div>

      {/* Content grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column — Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event info bar */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Saturday, March 14, 2026</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span>9:00 PM – 4:00 AM</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Foro Sol, Mexico City</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span>42,000+ attending</span>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-warning">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4" />
                <span className="ml-1 text-muted-foreground">(4.2 · 1,847 reviews)</span>
              </div>
              <div className="flex-1" />
              <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">About this event</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Neon Nights Festival returns for its 5th edition, bringing together the world's top electronic music artists for an unforgettable night at the iconic Foro Sol. Experience cutting-edge production, immersive light shows, and the energy of over 40,000 music lovers united under the Mexico City skyline.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This year features four stages, extended hours until 4 AM, and an exclusive VIP experience with premium viewing areas, dedicated bars, and artist meet & greets. Don't miss the biggest night of 2026.
              </p>
            </div>

            {/* Lineup */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Lineup</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LINEUP.map((act) => (
                  <div key={act.name} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-gradient-green">
                      {act.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{act.name}</p>
                      <p className="text-xs text-muted-foreground">{act.time} · {act.stage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Venue */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Venue</h2>
              <div className="rounded-xl overflow-hidden border border-border">
                <img src={venuePhoto} alt="Foro Sol" className="w-full h-48 object-cover" />
                <div className="p-4 bg-card">
                  <h3 className="font-semibold mb-1">Foro Sol</h3>
                  <p className="text-sm text-muted-foreground">Viaducto Piedad, Granjas México, 08400 CDMX</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Info className="w-3 h-3" /> 65,000 capacity</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified venue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — Ticket selector (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="rounded-2xl bg-card border border-border p-5 glow-green">
                <h3 className="text-lg font-semibold mb-4">Select tickets</h3>

                <div className="space-y-3 mb-5">
                  {TICKET_TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => tier.available && setSelectedTier(tier)}
                      disabled={!tier.available}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        !tier.available
                          ? "border-border bg-secondary/30 opacity-40 cursor-not-allowed"
                          : selectedTier.id === tier.id
                          ? "border-primary glow-green bg-secondary"
                          : "border-border bg-secondary hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">{tier.label}</span>
                        {!tier.available && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sold out</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{tier.description}</p>
                      <span className="text-sm font-mono font-semibold text-primary">${tier.price.toLocaleString()} MXN</span>
                    </button>
                  ))}
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between mb-5 px-1">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-secondary hover:bg-muted flex items-center justify-center text-sm font-medium transition-colors"
                    >−</button>
                    <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(8, quantity + 1))}
                      className="w-8 h-8 rounded-lg bg-secondary hover:bg-muted flex items-center justify-center text-sm font-medium transition-colors"
                    >+</button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between mb-2 px-1 text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono font-semibold">${(selectedTier.price * quantity).toLocaleString()} MXN</span>
                </div>
                <div className="flex items-center justify-between mb-4 px-1 text-sm">
                  <span className="text-muted-foreground">Service fee</span>
                  <span className="font-mono text-muted-foreground">${Math.round(selectedTier.price * quantity * 0.08).toLocaleString()} MXN</span>
                </div>

                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Buy tickets · ${(Math.round(selectedTier.price * quantity * 1.08)).toLocaleString()} MXN
                </button>

                <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Secure checkout · Crypto accepted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© 2026 BoletaMX. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Help</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

      {/* Checkout Drawer */}
      <CheckoutDrawer
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        ticketType={selectedTier.label}
        quantity={quantity}
        unitPrice={selectedTier.price}
      />
    </div>
  );
};

export default EventPage;
