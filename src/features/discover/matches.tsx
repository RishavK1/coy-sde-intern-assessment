"use client";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Heart, ShieldCheck } from "lucide-react";
import { request } from "./api";
import { ProfilePhoto } from "./profile-photo";
import type { Match } from "./types";
export function Matches() {
  const {
    data,
    error,
    isLoading: loading,
    mutate,
  } = useSWR<{ matches: Match[] }>("/matches", request);
  const matches = data?.matches ?? [];
  return (
    <main className="matches-main">
      <Link href="/discover" className="back-link">
        <ArrowLeft size={17} /> Back to Discover
      </Link>
      <p className="eyebrow">THE FEELING GOES BOTH WAYS</p>
      <h1>
        Your matches<span className="pink-dot">.</span>
      </h1>
      <p className="intro">A little curiosity. A mutual connection.</p>
      <div className="privacy-note">
        <ShieldCheck size={17} />
        <span>Only people you’ve both liked appear here.</span>
      </div>
      {loading ? (
        <p role="status" className="loading-copy">
          Loading your matches…
        </p>
      ) : error ? (
        <div className="error-message" role="alert">
          {error.message}
          <button onClick={() => void mutate()}>Try again</button>
        </div>
      ) : matches.length ? (
        <div className="matches-grid">
          {matches.map(({ profile: p }) => (
            <article className="match-card" key={p.id}>
              <div className="match-card-photo">
                <ProfilePhoto src={p.photo} name={p.name} />
                <span className="mutual-badge">
                  <Heart size={13} fill="currentColor" /> Mutual
                </span>
              </div>
              <div className="match-card-info">
                <h2>
                  {p.name}, {p.age}
                </h2>
                <p>{p.location}</p>
                <div className="interests">
                  {p.interests.slice(0, 2).map((i) => (
                    <span key={i}>{i}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <div className="empty-icon">
            <Heart size={32} />
          </div>
          <h2>
            Good things
            <br />
            start with a hello.
          </h2>
          <p>
            No mutual matches yet.
            <br />
            Meet someone new in Discover.
          </p>
          <Link href="/discover" className="button primary">
            Explore Discover <ArrowRight size={18} />
          </Link>
        </section>
      )}
    </main>
  );
}
