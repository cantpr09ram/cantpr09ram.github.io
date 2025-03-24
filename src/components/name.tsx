import React from "react";

interface NameTransitionProps {
  name1: string;
  name2: string;
}

export function NameTransition({ name1, name2 }: NameTransitionProps) {
  const maxLength = Math.max(name1.length, name2.length);
  const paddedName1 = name1.toUpperCase().padEnd(maxLength, " ");
  const paddedName2 = name2.toUpperCase().padEnd(maxLength, " ");

  return (
    <h1 className="font-medium pt-12 transition-element">
      <span className="sr-only">{name1}</span>
      <span aria-hidden="true" className="block overflow-hidden group relative">
        <span className="inline-block transition-all duration-300 ease-in-out group-hover:-translate-y-full whitespace-nowrap">
          {paddedName1.split("").map((letter, index) => (
            <span
              key={index}
              className="inline-block"
              style={{ transitionDelay: `${index * 25}ms` }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </span>
        <span className="inline-block absolute left-0 top-0 transition-all duration-300 ease-in-out translate-y-full group-hover:translate-y-0">
          {paddedName2.split("").map((letter, index) => (
            <span
              key={index}
              className="inline-block"
              style={{ transitionDelay: `${index * 25}ms` }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </span>
      </span>
    </h1>
  );
}
