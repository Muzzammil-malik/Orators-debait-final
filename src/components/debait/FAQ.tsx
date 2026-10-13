import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Kicker } from "./primitives";

interface FAQItem {
  q: string;
  a: string;
}

const faqItems: FAQItem[] = [
  {
    q: "Who can take part in DE'BAIT 2026?",
    a: "The tournament is open to all enrolled students across Engineering, Law, Pharmacy, and B.Ed streams. There are no departmental quotas or branch limitations.",
  },
  {
    q: "How many members are required per team?",
    a: "Exactly 5 members per team: 3 Primary Speakers and 2 Rebuttal/Strategy members (substitutes). Once finalized and submitted, team members and leads cannot be altered.",
  },
  {
    q: "What is the registration fee?",
    a: "Registration is ₹199 per team for shortlisted participants following the initial verification of entry passes.",
  },
  {
    q: "What is the official debate format and structure?",
    a: "16 teams begin in the preliminary rounds. Eight advance to four quarter-finals, then the four quarter-final winners compete in two semi-finals before the Grand Championship Final.",
  },
  {
    q: "What is the theme of DE'BAIT 2026?",
    a: "The central theme is 'Social Media & Digital Natives'. Motions will explore digital ethics, platform power, online identity, algorithmic curation, and modern communication.",
  },
  {
    q: "How does the Switch Round work?",
    a: "At one round chosen randomly by organizers without prior notice, teams are ordered to swap stances. A 5-minute emergency preparation window is granted. Judges score strictly on adaptability, logical consistency, and composure.",
  },
  {
    q: "How are matches judged and scored?",
    a: "Every debate round is scored on an official 100-point rubric: Content & Reasoning (40 points), Strategy & Rebuttal (30 points), and Style & Delivery (30 points). The decision of the adjudication panel is certified and final.",
  },
  {
    q: "Does audience voting affect the official tournament winner?",
    a: "No. The live Audience Pulse tracks real-time room sentiment and crowd engagement during Zone 02 Open Crossfire, but it is strictly separate from the official judge scores.",
  },
  {
    q: "Where and when is the event taking place?",
    a: "12–13 October 2026 at Seminar Hall, Block 4, Muffakham Jah College of Engineering and Technology (MJCET), Hyderabad.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="grain relative bg-canvas px-5 py-24 text-mist md:px-10 md:py-32"
      aria-labelledby="faq-h"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.8fr]">
          <div>
            <Kicker n="12">Questions &amp; Clarifications</Kicker>
            <h2 id="faq-h" className="display text-6xl text-mist md:text-8xl">
              Frequently <br />
              <span className="text-sun">Asked.</span>
            </h2>
            <p className="mt-6 max-w-sm font-serif text-lg text-mist/75">
              Everything you need to know about team eligibility, tournament mechanics, switch round
              protocols, and scoring rubrics.
            </p>
          </div>

          <div className="border-t-2 border-line">
            {faqItems.map((item, idx) => {
              const isOpen = open === idx;
              return (
                <div key={idx} className="border-b border-line transition-colors">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${idx}`}
                      className={`flex w-full items-center justify-between gap-6 py-6 text-left transition-colors focus-visible:outline-2 focus-visible:outline-hot ${
                        isOpen ? "text-sun" : "text-mist hover:text-sun/85"
                      }`}
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="font-type text-xs text-hot uppercase tracking-wider shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="display text-2xl tracking-wide md:text-3xl">{item.q}</span>
                      </span>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                          isOpen
                            ? "border-hot bg-hot text-paper rotate-45"
                            : "border-line bg-surface text-mist/60 group-hover:border-sun/60"
                        }`}
                      >
                        <Plus size={18} />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${idx}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 pl-9 pr-6 font-serif text-base leading-relaxed text-mist/85 md:text-lg">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
