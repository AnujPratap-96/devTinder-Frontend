import React from "react";

export const highlightText = (text, query) => {
  if (!query?.trim()) return text;
  const parts = String(text).split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-brand-500/40 text-brand-100 rounded-sm px-0.5">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
};
