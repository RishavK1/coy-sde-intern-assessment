"use client";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { MapPin, Sparkles } from "lucide-react";
import { ProfilePhoto } from "./profile-photo";
import type { Decision, Profile } from "./types";
export function ProfileCard({
  current,
  busy,
  direction,
  onSwipe,
}: {
  current: Profile;
  busy: boolean;
  direction: number;
  onSwipe: (decision: Decision) => void;
}) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-12, 12]);
  const likeOpacity = useTransform(x, [20, 110], [0, 1]);
  const passOpacity = useTransform(x, [-110, -20], [1, 0]);
  return (
    <motion.article
      className="profile-card"
      custom={direction}
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={
        reduced
          ? { opacity: 0 }
          : { x: direction * 450, opacity: 0, rotate: direction * 12 }
      }
      transition={{ duration: reduced ? 0.1 : 0.23 }}
      style={{ x, rotate: reduced ? 0 : rotate }}
      drag={busy ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.65}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 550)
          void onSwipe(info.offset.x > 0 ? "like" : "pass");
        else x.set(0);
      }}
    >
      <div className="profile-image">
        <ProfilePhoto src={current.photo} name={current.name} priority />
        <div className="image-scrim" />
        <span className="profile-badge">
          <Sparkles size={13} /> A little possibility
        </span>
        <motion.div
          className="swipe-stamp like-stamp"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </motion.div>
        <motion.div
          className="swipe-stamp pass-stamp"
          style={{ opacity: passOpacity }}
        >
          PASS
        </motion.div>
        <div className="profile-identity">
          <h2>
            {current.name}
            <span>, {current.age}</span>
          </h2>
          <p>
            <MapPin size={16} />
            {current.location}
          </p>
        </div>
      </div>
      <div className="profile-details">
        <p>{current.bio}</p>
        <div className="interests" aria-label="Interests">
          {current.interests.map((i) => (
            <span key={i}>{i}</span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
