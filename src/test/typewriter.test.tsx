import { render, act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Hero } from "@/components/debait/Hero";
import {
  CinematicTransitionProvider,
  useCinematicTransition,
} from "@/components/debait/CinematicTransition";

function TransitionHarness() {
  const { play } = useCinematicTransition();
  return (
    <>
      <button onClick={() => play(() => document.body.setAttribute("data-destination", "ready"))}>
        Navigate
      </button>
      <p>Current page</p>
    </>
  );
}

describe("Hero and Typewriter stability", () => {
  it("renders Hero and cycles through typewriter phrases without throwing", () => {
    vi.useFakeTimers();
    const { container } = render(
      <CinematicTransitionProvider>
        <Hero introReady={true} />
      </CinematicTransitionProvider>,
    );

    // Fast-forward through multiple full cycles of typing and deleting
    // 1 cycle = ~4.5s. 5 cycles = 25s.
    act(() => {
      vi.advanceTimersByTime(25000);
    });

    expect(container).toBeDefined();
    expect(container.innerHTML).not.toContain("This page didn't load");
    vi.useRealTimers();
  });

  it("covers navigation with a charcoal wipe and changes pages at the midpoint", () => {
    vi.useFakeTimers();
    render(
      <CinematicTransitionProvider>
        <TransitionHarness />
      </CinematicTransitionProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Navigate" }));
    const wipe = document.querySelector('[data-transition-phase="cover"]');
    expect(wipe).toBeInTheDocument();
    expect(wipe).toHaveClass("bg-hot");
    expect(document.body).not.toHaveTextContent("DE'BAIT");

    act(() => vi.advanceTimersByTime(269));
    expect(document.body).not.toHaveAttribute("data-destination");
    act(() => vi.advanceTimersByTime(1));
    expect(document.body).toHaveAttribute("data-destination", "ready");
    const revealWipe = document.querySelector('[data-transition-phase="reveal"]');
    expect(revealWipe).toBeInTheDocument();
    expect(revealWipe).toHaveClass("bg-sun");

    act(() => vi.advanceTimersByTime(270));
    expect(document.querySelector("[data-transition-phase]")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
