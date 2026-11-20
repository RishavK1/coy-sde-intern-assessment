"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { Heart, X, ArrowRight } from "lucide-react";
import { ProfilePhoto } from "./profile-photo";
import type { Match } from "./types";
export function MatchDialog({
  match,
  onClose,
}: {
  match: Match;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog ref={ref} className="match-dialog" onCancel={onClose}>
      <button
        className="icon-button close-dialog"
        onClick={onClose}
        aria-label="Close match screen"
      >
        <X />
      </button>
      <div className="match-heart">
        <Heart size={30} fill="currentColor" />
      </div>
      <p className="eyebrow">THE FEELING IS MUTUAL</p>
      <h2>It’s a match!</h2>
      <p>
        You and {match.profile.name} liked each other.
        <br />A little courage looks good on you.
      </p>
      <div className="match-portrait">
        <ProfilePhoto src={match.profile.photo} name={match.profile.name} />
      </div>
      <strong>
        {match.profile.name}, {match.profile.age}
      </strong>
      <button className="button primary" onClick={onClose}>
        Keep discovering <ArrowRight size={18} />
      </button>
      <Link className="text-link" href="/discover/matches" onClick={onClose}>
        View your matches
      </Link>
    </dialog>
  );
}
