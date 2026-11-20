"use client";
import { useState } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
export function ProfilePhoto({
  src,
  name,
  priority = false,
}: {
  src: string;
  name: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div
      className="photo-fallback"
      role="img"
      aria-label={`Photo unavailable for ${name}`}
    >
      <UserRound size={64} strokeWidth={1} />
      <span>{name}</span>
    </div>
  ) : (
    <Image
      width={600}
      height={800}
      unoptimized
      src={src}
      alt={`${name}'s profile`}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}
