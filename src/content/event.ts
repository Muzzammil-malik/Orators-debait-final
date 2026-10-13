// Official DE'BAIT content, sourced from the Orators' Club rulebook v2.1 and poster.
// Keep UI components free of hard-coded event facts — edit here.

export type ScheduleItem = { time: string; title: string };
export type ScheduleDay = { label: string; date: string; items: ScheduleItem[] };

export const event = {
  name: "DE'BAIT",
  organizer: "Orators' Club",
  college: "MJCET",
  collegeFull: "Muffakham Jah College of Engineering and Technology, Hyderabad",
  slogan: ["Same minds,", "different arguments."],
  theme: ["Social Media", "& Digital Natives"],
  venue: "Seminar Hall, Block 4",
  // Dates and times are configurable: the source documents disagree
  // (cover lists 2PM–4PM, schedule lists 12:00–4:00). Confirm before launch.
  dates: ["12 Oct 2026", "13 Oct 2026"],
  timeNote: "Timings to be confirmed by the organizers",
  instagram: "@oratorsclubmjcet",
  instagramUrl: "https://instagram.com/oratorsclubmjcet",
  contacts: [
    { name: "Abdul Majeed", phone: "7794066803" },
    { name: "Uzma Durdana", phone: "9346350242" },
  ],
  streams: ["Engineering", "Law", "Pharmacy", "B.Ed"],
};

export const pillars = ["Confidence", "Articulation", "Spontaneity"];

export const stats = [
  { value: 16, label: "Teams competing" },
  { value: 5, label: "Members per team" },
  { value: 2, label: "Days of competition" },
  { value: 100, label: "Points per round" },
];

export const stages = [
  { name: "Preliminary Rounds", teams: 16, note: "All 16 teams debate. Top 8 advance." },
  { name: "Quarter-finals", teams: 8, note: "Four knockout matches. Winners advance." },
  { name: "Semi-finals", teams: 4, note: "Two decisive knockout matches." },
  { name: "Final", teams: 2, note: "Two teams. One stage. One champion crowned." },
];

export const zones = [
  {
    n: "01",
    title: "Opening Cases",
    body: "All 3 Core Speakers take the floor and build their strongest case. No twist here, just casework, uninterrupted.",
  },
  {
    n: "02",
    title: "Open Crossfire",
    body: "Both Subs step up for rebuttals. A buzzer can strike at any random second, or not at all, to force a side-switch. Time stops for 10 seconds: the speaker takes the hit and switches sides, or tags in an emergency Sub. Substitutions are one-way.",
  },
  {
    n: "03",
    title: "Final Statement",
    body: "One Core Speaker returns for a 90-second final statement, defending whichever side they're currently stuck with.",
  },
];

export const switchFacts = [
  {
    k: "Where it strikes",
    v: "Any single round: Prelims, Quarter-finals or Semi-finals, chosen at random by the organizers.",
  },
  { k: "Prep time", v: "A 5-minute emergency preparation window once the switch is announced." },
  {
    k: "No penalty",
    v: "Judges score purely on adaptability, reasoning and delivery under the new stance.",
  },
];

export const switchTips = [
  {
    t: "Stay in character",
    b: "No arguing about the switch. Sell the new side like you always believed it.",
  },
  {
    t: "Bring new angles",
    b: "Reuse opponents' Zone 1 points if you want, but add new angles. Repeats score nothing.",
  },
  { t: "Attack your own case", b: "Tear down the arguments your own team made in Zone 1." },
];

export const scoring = [
  { label: "Content", points: 40, desc: "Strength & relevance of arguments" },
  { label: "Strategy", points: 30, desc: "Rebuttal quality & structure" },
  { label: "Style", points: 30, desc: "Delivery, clarity & persuasiveness" },
];

export const schedule: ScheduleDay[] = [
  {
    label: "Day 01",
    date: event.dates[0]!,
    items: [
      { time: "12:00–12:15", title: "Reporting, registration & inauguration" },
      { time: "12:15–12:30", title: "Briefing: rules, format & judging" },
      { time: "12:30–2:30", title: "Preliminary Round (all 16 teams)" },
      { time: "2:30–3:00", title: "Lunch break" },
      { time: "3:00–4:00", title: "Scoring & Top 8 announced" },
    ],
  },
  {
    label: "Day 02",
    date: event.dates[1]!,
    items: [
      { time: "12:00–12:30", title: "Reporting & Quarter-finals briefing" },
      { time: "12:30–1:45", title: "Quarter-finals & Semi-finals" },
      { time: "1:45–2:15", title: "Lunch break & deliberation" },
      { time: "2:15–3:30", title: "Grand Championship Final" },
      { time: "3:30–4:00", title: "Prize distribution & closing ceremony" },
    ],
  },
];

export const rules = [
  {
    title: "Team composition",
    body: "16 teams, open registration on a first-come, first-served basis. Open to Engineering, Law, Pharmacy & B.Ed students. No departmental quotas. 5 members per team.",
  },
  {
    title: "Primary Speakers & Rebuttal / Strategy",
    body: "3 Primary Speakers deliver constructive speeches, build and extend the case, and may accept Points of Information. 2 Rebuttal / Strategy members counter opposing arguments, handle cross-questioning and deliver closing rebuttals.",
  },
  {
    title: "Points of Information",
    body: "Points of Information may be offered during a speech. The speaker may accept or decline.",
  },
  {
    title: "Protected time",
    body: "No Points of Information during the first and last minute of a speech.",
  },
  {
    title: "Scoring",
    body: "100 points per round: Content 40, Strategy 30, Style 30. Speakers significantly over or under time are marked down. The judges' decision for each round is final.",
  },
  {
    title: "Switch Round",
    body: "At one unannounced round, both teams must argue the opposite side of the motion, with a 5-minute preparation window. No penalty for switching.",
  },
  {
    title: "Match flow & conduct",
    body: "Each round is fought on a pre-announced motion: Proposition argues For, Opposition Against. Teams stay on their assigned side. Interruptions, personal remarks or unparliamentary language may lead to disqualification.",
  },
];
