"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Heart,
  ShieldCheck,
  X,
  RefreshCw,
  Check,
} from "lucide-react";
import { request } from "./api";
import { ProfileCard } from "./profile-card";
import { MatchDialog } from "./match-dialog";
import type { Decision, Match, Profile, SwipeResult } from "./types";
export function Discover() {
  const {
    data,
    error: feedError,
    isLoading: loading,
    mutate,
  } = useSWR<{ feed: Profile[] }>("/feed", request, {
    revalidateOnFocus: true,
  });
  const profiles = data?.feed ?? [];
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [direction, setDirection] = useState(1);
  const [match, setMatch] = useState<Match | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const lock = useRef(false);
  const current = profiles[0];
  async function swipe(decision: Decision) {
    if (!current || lock.current || match) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setDirection(decision === "like" ? 1 : -1);
    try {
      const result = await request<SwipeResult>("/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: current.id, decision }),
      });
      await mutate(
        { feed: profiles.filter((v) => v.id !== current.id) },
        { revalidate: false },
      );
      setAnnouncement(
        decision === "like"
          ? `Liked ${current.name}.`
          : `Passed on ${current.name}.`,
      );
      if (result.createdMatch && result.match) setMatch(result.match);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Your swipe was not saved. Try again.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <main className="discover-main">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MEET YOUR NEXT MAYBE</p>
          <h1>
            Discover<span className="pink-dot">.</span>
          </h1>
        </div>
        <Link className="matches-link" href="/discover/matches">
          <Heart size={18} />
          <span>Matches</span>
          <ArrowRight size={16} />
        </Link>
      </div>
      <p className="intro">A new face. A shared interest. See where it goes.</p>
      <div className="privacy-note">
        <ShieldCheck size={17} />
        <span>Your likes stay private. Until it’s mutual.</span>
      </div>
      {(error || feedError) && (
        <div className="error-message" role="alert">
          {error || feedError?.message}
          {!current && <button onClick={() => void mutate()}>Try again</button>}
        </div>
      )}
      {loading ? (
        <div
          className="profile-skeleton"
          aria-label="Loading profiles"
          role="status"
        >
          <span />
          <p>Finding new faces…</p>
        </div>
      ) : current ? (
        <>
          <div className="card-stage">
            <AnimatePresence mode="wait" custom={direction}>
              <ProfileCard
                key={current.id}
                current={current}
                busy={busy || !!match}
                direction={direction}
                onSwipe={swipe}
              />
            </AnimatePresence>
          </div>
          <div className="swipe-actions">
            <button
              className="swipe-button pass-button"
              disabled={busy || !!match}
              onClick={() => void swipe("pass")}
              aria-label={`Pass on ${current.name}`}
            >
              <X size={25} />
              <span>Pass</span>
            </button>
            <span className="gesture-hint">
              A spark starts
              <br />
              with a swipe.
            </span>
            <button
              className="swipe-button like-button"
              disabled={busy || !!match}
              onClick={() => void swipe("like")}
              aria-label={`Like ${current.name}`}
            >
              <Heart size={24} />
              <span>Like</span>
            </button>
          </div>
          <p className="swipe-instruction">
            {busy
              ? "Saving your choice…"
              : "Swipe left to pass. Right to like."}
          </p>
        </>
      ) : !error && !feedError ? (
        <section className="empty-state">
          <div className="empty-icon">
            <Check size={32} />
          </div>
          <p className="eyebrow">YOU’RE ALL CAUGHT UP</p>
          <h2>
            A little pause.
            <br />
            More possibilities later.
          </h2>
          <p>
            You’ve seen everyone for now.
            <br />
            Your matches are waiting right here.
          </p>
          <Link href="/discover/matches" className="button primary">
            View matches <Heart size={18} />
          </Link>
          <button className="text-link" onClick={() => void mutate()}>
            <RefreshCw size={15} /> Check again
          </button>
        </section>
      ) : null}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>
      {match && <MatchDialog match={match} onClose={() => setMatch(null)} />}
    </main>
  );
}
