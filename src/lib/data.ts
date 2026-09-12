export type Status = "open" | "advisory" | "closed" | "season";

export const STATUS: Record<
  Status,
  {
    label: string;
    glyph: string;
    shape: "circle" | "triangle" | "octagon" | "square";
    dot: string;
    chip: string;
  }
> = {
  open: {
    label: "Open",
    glyph: "✓",
    shape: "circle",
    dot: "bg-emerald-400",
    chip: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  advisory: {
    label: "Advisory",
    glyph: "!",
    shape: "triangle",
    dot: "bg-amber-400",
    chip: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  closed: {
    label: "Closed",
    glyph: "✕",
    shape: "octagon",
    dot: "bg-red-500",
    chip: "bg-red-500/10 text-red-300 border-red-500/30",
  },
  season: {
    label: "Closed for season",
    glyph: "–",
    shape: "square",
    dot: "bg-neutral-500",
    chip: "bg-white/5 text-white/70 border-white/20",
  },
};

export type Beach = {
  id: string;
  name: string;
  water: "lake" | "ocean";
  lat: number;
  lng: number;
  status: Status;
  result: string;
  sampled: string;
  plain: string;
  vibe: "peaceful" | "busy";
};

export const BEACHES: Beach[] = [
  {
    id: "chocolate-lake",
    name: "Chocolate Lake Beach",
    water: "lake",
    lat: 44.6376,
    lng: -63.6065,
    status: "open",
    result: "18 E. coli CFU / 100 mL",
    sampled: "Sampled Sep 11, 9:05 AM",
    plain: "Well under the safe limit. Swimming is fine today.",
    vibe: "busy",
  },
  {
    id: "kearney-lake",
    name: "Kearney Lake Beach",
    water: "lake",
    lat: 44.6905,
    lng: -63.6625,
    status: "open",
    result: "24 E. coli CFU / 100 mL",
    sampled: "Sampled Sep 11, 8:40 AM",
    plain: "Clean water. Supervised until 6 PM.",
    vibe: "peaceful",
  },
  {
    id: "albro-lake",
    name: "Albro Lake Beach",
    water: "lake",
    lat: 44.6767,
    lng: -63.5709,
    status: "advisory",
    result: "218 E. coli CFU / 100 mL",
    sampled: "Sampled Sep 11, 9:20 AM",
    plain: "Bacteria are elevated after the weekend rain. Swim at your own risk and keep your head above water.",
    vibe: "busy",
  },
  {
    id: "birch-cove",
    name: "Birch Cove Beach",
    water: "lake",
    lat: 44.6805,
    lng: -63.5632,
    status: "open",
    result: "31 E. coli CFU / 100 mL",
    sampled: "Sampled Sep 11, 8:55 AM",
    plain: "Safe to swim. Shallow and warm near the dock.",
    vibe: "busy",
  },
  {
    id: "penhorn-lake",
    name: "Penhorn Lake Beach",
    water: "lake",
    lat: 44.6796,
    lng: -63.53,
    status: "closed",
    result: "640 E. coli CFU / 100 mL",
    sampled: "Sampled Sep 11, 9:35 AM",
    plain: "Closed to swimming. Bacteria are far above the safe limit and contact with the water can make you sick.",
    vibe: "peaceful",
  },
  {
    id: "rainbow-haven",
    name: "Rainbow Haven Beach",
    water: "ocean",
    lat: 44.6483,
    lng: -63.4148,
    status: "open",
    result: "12 Enterococci CFU / 100 mL",
    sampled: "Sampled Sep 10, 10:10 AM",
    plain: "Clean ocean water. Surf is moderate, lifeguards on duty.",
    vibe: "busy",
  },
  {
    id: "lawrencetown",
    name: "Lawrencetown Beach",
    water: "ocean",
    lat: 44.6411,
    lng: -63.3547,
    status: "advisory",
    result: "96 Enterococci CFU / 100 mL",
    sampled: "Sampled Sep 10, 10:30 AM",
    plain: "Water is borderline after runoff. Surfing is fine, swimming with young kids is not advised.",
    vibe: "busy",
  },
  {
    id: "conrads",
    name: "Conrad's Beach",
    water: "ocean",
    lat: 44.6494,
    lng: -63.4386,
    status: "season",
    result: "No sample — monitoring ended",
    sampled: "Last sampled Aug 31",
    plain: "Unsupervised until next summer. No testing and no lifeguards.",
    vibe: "peaceful",
  },
  {
    id: "crystal-crescent",
    name: "Crystal Crescent Beach",
    water: "ocean",
    lat: 44.4494,
    lng: -63.6169,
    status: "open",
    result: "8 Enterococci CFU / 100 mL",
    sampled: "Sampled Sep 10, 11:00 AM",
    plain: "Cleanest reading in the region this week. Cold, but pristine.",
    vibe: "peaceful",
  },
  {
    id: "dollar-lake",
    name: "Dollar Lake Beach",
    water: "lake",
    lat: 44.9269,
    lng: -63.3253,
    status: "open",
    result: "15 E. coli CFU / 100 mL",
    sampled: "Sampled Sep 11, 9:15 AM",
    plain: "Safe to swim. Quiet on weekdays, sandy bottom.",
    vibe: "peaceful",
  },
  {
    id: "martinique",
    name: "Martinique Beach",
    water: "ocean",
    lat: 44.6889,
    lng: -63.1394,
    status: "season",
    result: "No sample — monitoring ended",
    sampled: "Last sampled Aug 31",
    plain: "Supervision has wrapped for the year. Walk it, don't swim it.",
    vibe: "peaceful",
  },
  {
    id: "queensland",
    name: "Queensland Beach",
    water: "ocean",
    lat: 44.6083,
    lng: -64.0392,
    status: "open",
    result: "20 Enterococci CFU / 100 mL",
    sampled: "Sampled Sep 10, 9:45 AM",
    plain: "Good water in a sheltered cove. The warmest ocean swim near the city.",
    vibe: "busy",
  },
];

export type SCEvent = {
  id: string;
  title: string;
  host: string;
  lat: number;
  lng: number;
  when: string;
  time: string;
  near: string;
  blurb: string;
  detail: string;
  price: string;
};

export const EVENTS: SCEvent[] = [
  {
    id: "sunset-kayak",
    title: "Sunset Kayak Meetup",
    host: "Halifax Paddle Club",
    lat: 44.6398,
    lng: -63.6021,
    when: "Fri, Sep 12",
    time: "6:30 – 8:30 PM",
    near: "Chocolate Lake Beach",
    blurb: "Casual paddle around the lake, boats provided.",
    detail:
      "Meet at the boat launch on the north side of Chocolate Lake. Twenty loaner kayaks, first come first served, life jackets included. Beginners welcome — the club runs a ten minute intro on the grass before launch. Cancelled if there is lightning within 10 km.",
    price: "Free",
  },
  {
    id: "volleyball",
    title: "Beach Volleyball League",
    host: "Dartmouth Rec",
    lat: 44.678,
    lng: -63.5714,
    when: "Sat, Sep 13",
    time: "10:00 AM – 2:00 PM",
    near: "Albro Lake Beach",
    blurb: "Six courts, drop-in teams from 10 AM.",
    detail:
      "Round robin on the six sand courts beside the change house. Drop-in players are slotted into short teams at the scorer's table each hour. Bring water, the canteen is cash only. Spectating is free and there is shade along the tree line.",
    price: "$5 drop-in",
  },
  {
    id: "surf-lesson",
    title: "Beginner Surf Lesson",
    host: "East Coast Surf School",
    lat: 44.6421,
    lng: -63.3562,
    when: "Sat, Sep 13",
    time: "9:00 – 11:00 AM",
    near: "Lawrencetown Beach",
    blurb: "Two hour lesson, wetsuit and board included.",
    detail:
      "Two hours in the water with two instructors, capped at eight people. Wetsuits, booties and soft-top boards are included in the price. Meet at the surf shop across the road twenty minutes early to get sized. Water is 17°C, a hood is optional.",
    price: "$65",
  },
  {
    id: "market",
    title: "Waterfront Farmers Market",
    host: "Dartmouth North",
    lat: 44.6712,
    lng: -63.5688,
    when: "Sun, Sep 14",
    time: "8:00 AM – 1:00 PM",
    near: "Birch Cove Beach",
    blurb: "Forty vendors, ten minutes from the beach.",
    detail:
      "Forty vendors under the pavilion: produce, baked goods, coffee and a handful of prepared food stalls. Dog friendly on the outer aisle. Free parking fills by 9 AM, but the ferry drops you two blocks away.",
    price: "Free",
  },
  {
    id: "sunrise-swim",
    title: "Sunrise Swim Club",
    host: "Kearney Swimmers",
    lat: 44.6918,
    lng: -63.6641,
    when: "Every weekday",
    time: "6:15 – 7:15 AM",
    near: "Kearney Lake Beach",
    blurb: "Quiet open-water swim before work.",
    detail:
      "An informal group that swims the 400 m shoreline loop every weekday morning. A bright cap and a tow float are required, and someone always stays on shore as a spotter. No sign-up, just show up at the second picnic table.",
    price: "Free",
  },
  {
    id: "shoreline-cleanup",
    title: "Great Shoreline Cleanup",
    host: "Coastal Action",
    lat: 44.6461,
    lng: -63.4167,
    when: "Sun, Sep 14",
    time: "11:00 AM – 2:00 PM",
    near: "Rainbow Haven Beach",
    blurb: "Bring gloves, gear and bags provided.",
    detail:
      "Volunteers sweep the dune boardwalk and the tidal flats at low tide. Bags, grabbers and data sheets are handed out at the main lot; bring your own gloves and closed shoes. It counts as volunteer hours and Coastal Action signs forms on site.",
    price: "Free",
  },
];
