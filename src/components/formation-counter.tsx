"use client";

import { useId, useState } from "react";

type Point = { x: number; y: number; label: string };

type Counter = { counter: string; why: string };

const FORMATIONS = [
  "2-3-2",
  "3-3-1",
  "3-2-2",
  "2-4-1",
  "3-1-3",
  "2-1-3-1",
  "3-1-2-1",
] as const;

type Formation = (typeof FORMATIONS)[number];

type FieldSize = "small" | "medium" | "large";

const FIELD_SIZES: { value: FieldSize; label: string; width: string; icon: { w: number; h: number } }[] = [
  { value: "small", label: "Small field", width: "sm:max-w-[40rem]", icon: { w: 10, h: 6.5 } },
  { value: "medium", label: "Medium field", width: "sm:max-w-[56rem]", icon: { w: 15, h: 10 } },
  { value: "large", label: "Large field", width: "sm:max-w-none", icon: { w: 20, h: 13 } },
];

const COUNTERS: Record<Formation, Counter> = {
  "2-3-2": {
    counter: "3-3-1",
    why: "Three defenders outnumber their two strikers, the midfield stays even at three apiece, and your lone forward keeps one of their two defenders busy so the other can't step up.",
  },
  "3-3-1": {
    counter: "2-4-1",
    why: "Four midfielders against three wins the middle of the pitch, and their single striker is handled comfortably by two defenders.",
  },
  "3-2-2": {
    counter: "2-3-2",
    why: "Three midfielders against two gives you the ball. Two forwards sit on their back three so the defenders can't push into midfield to help.",
  },
  "2-4-1": {
    counter: "2-3-2",
    why: "Skip the crowded midfield and play direct. Their two defenders are isolated against your two forwards, and their lone striker is doubled up by your two defenders.",
  },
  "3-1-3": {
    counter: "3-3-1",
    why: "Three defenders match their three forwards one for one, and your three midfielders swarm their single holding player whenever they try to build.",
  },
  "2-1-3-1": {
    counter: "3-2-2",
    why: "Their two defenders sit alone behind four midfielders, so your two forwards go at them two on two. Three defenders absorb the striker and the runners arriving from midfield.",
  },
  "3-1-2-1": {
    counter: "2-4-1",
    why: "Four midfielders overload their three, and their lone striker gives your two defenders an easy afternoon.",
  },
};

const W = 1050;
const H = 680;

function lines(formation: string): number[] {
  return formation.split("-").map(Number);
}

function roleFor(index: number, total: number): string {
  if (index === 0) return "DF";
  if (index === total - 1) return "FW";
  return "MF";
}

/** Positions for a team defending the left goal and attacking to the right. */
function placeLeft(formation: string): Point[] {
  const rows = lines(formation);
  const first = 150;
  const last = 460;
  const step = rows.length > 1 ? (last - first) / (rows.length - 1) : 0;
  const points: Point[] = [{ x: 62, y: H / 2, label: "GK" }];
  rows.forEach((count, i) => {
    const x = first + step * i;
    for (let j = 0; j < count; j++) {
      points.push({
        x,
        y: (H * (j + 1)) / (count + 1),
        label: roleFor(i, rows.length),
      });
    }
  });
  return points;
}

/** Swapping ends is a half turn, so a player's own left stays their left. */
function rotate(points: Point[]): Point[] {
  return points.map((p) => ({ ...p, x: W - p.x, y: H - p.y }));
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

export default function FormationCounter() {
  const [enemy, setEnemy] = useState<Formation>("2-3-2");
  const [allyOnLeft, setAllyOnLeft] = useState(true);
  const [size, setSize] = useState<FieldSize>("medium");
  const selectId = useId();

  const { counter, why } = COUNTERS[enemy];
  const allyBase = placeLeft(counter);
  const enemyBase = placeLeft(enemy);
  const ally = allyOnLeft ? allyBase : rotate(allyBase);
  const foes = allyOnLeft ? rotate(enemyBase) : enemyBase;

  const allyRows = lines(counter);
  const enemyRows = lines(enemy);
  const matchups = [
    {
      zone: "Your defense",
      ours: allyRows[0],
      theirs: enemyRows[enemyRows.length - 1],
      note: "defenders against their forwards",
    },
    {
      zone: "Midfield",
      ours: sum(allyRows.slice(1, -1)),
      theirs: sum(enemyRows.slice(1, -1)),
      note: "midfielders against theirs",
    },
    {
      zone: "Your attack",
      ours: allyRows[allyRows.length - 1],
      theirs: enemyRows[0],
      note: "forwards against their defenders",
    },
  ];

  const enemyPanel = (
    <label className="flex w-full max-w-sm flex-col gap-1.5" htmlFor={selectId}>
      <span className="text-sm font-medium text-red-700 dark:text-red-400">Opponent&apos;s formation</span>
      <span className="relative block">
        <select
          id={selectId}
          value={enemy}
          onChange={(e) => setEnemy(e.target.value as Formation)}
          className="h-12 w-full appearance-none rounded-lg border border-stone-300 bg-white pl-4 pr-10 text-base font-semibold text-stone-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50 dark:focus-visible:ring-offset-stone-950"
        >
          {FORMATIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-stone-500"
        >
          <path
            d="M5 8l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </label>
  );

  const allyPanel = (
    <div className={`flex w-full max-w-sm flex-col gap-1.5 ${allyOnLeft ? "" : "items-end text-right"}`}>
      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Your formation</span>
      <span className="flex h-12 items-center text-3xl font-semibold tabular-nums text-blue-700 dark:text-blue-400">
        {counter}
      </span>
    </div>
  );

  return (
    <div
      className={`mx-auto flex w-full flex-col gap-6 sm:gap-8 ${FIELD_SIZES.find((f) => f.value === size)?.width ?? ""}`}
    >
      <div className="flex w-full flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end sm:gap-6">
          <div className="flex justify-start">
            {allyOnLeft ? allyPanel : enemyPanel}
          </div>
          <div className="order-1 col-span-2 flex items-center justify-center gap-3 sm:order-none sm:col-span-1">
            <button
              type="button"
              aria-pressed={!allyOnLeft}
              onClick={() => setAllyOnLeft((v) => !v)}
              className="h-12 flex-1 rounded-lg border border-stone-300 bg-white px-5 text-base font-medium text-stone-900 shadow-sm outline-none transition-colors hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-stone-700 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50 active:bg-stone-200 sm:flex-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50 dark:hover:bg-stone-800 dark:focus-visible:ring-offset-stone-950"
            >
              Swap sides
            </button>
            <div
              role="radiogroup"
              aria-label="Field size"
              className="hidden h-12 overflow-hidden rounded-lg border border-stone-300 bg-white shadow-sm sm:flex dark:border-stone-700 dark:bg-stone-900"
            >
              {FIELD_SIZES.map((f) => {
                const active = f.value === size;
                return (
                  <button
                    key={f.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={f.label}
                    title={f.label}
                    onClick={() => setSize(f.value)}
                    className={`flex w-12 items-center justify-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-700 ${
                      active
                        ? "bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900"
                        : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                    }`}
                  >
                    <FieldIcon w={f.icon.w} h={f.icon.h} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end">
            {allyOnLeft ? enemyPanel : allyPanel}
          </div>
        </div>

        <figure className="flex flex-col gap-3">
          <Pitch ally={ally} foes={foes} allyOnLeft={allyOnLeft} enemy={enemy} counter={counter} />
          <figcaption className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-700 dark:text-stone-300">
            <span className="inline-flex items-center gap-2">
              <span className="size-3 rounded-full bg-blue-700 ring-2 ring-blue-200 dark:ring-blue-900" />
              Your team in {counter}, attacking {allyOnLeft ? "right" : "left"}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-3 rounded-full bg-red-600 ring-2 ring-red-200 dark:ring-red-950" />
              Opponent in {enemy}, attacking {allyOnLeft ? "left" : "right"}
            </span>
          </figcaption>
        </figure>
      </div>

      <section className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <dl className="flex flex-col divide-y divide-stone-200 dark:divide-stone-800">
          {matchups.map((m) => {
            const edge = m.ours > m.theirs ? "up" : m.ours < m.theirs ? "down" : "even";
            return (
              <div key={m.zone} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-sm text-stone-700 dark:text-stone-300">
                  {m.zone}
                  <span className="block text-xs text-stone-500">{m.note}</span>
                </dt>
                <dd className="flex items-baseline gap-2 text-2xl font-semibold tabular-nums text-stone-900 dark:text-stone-50">
                  <span className="text-blue-700 dark:text-blue-400">{m.ours}</span>
                  <span className="text-base font-normal text-stone-400">v</span>
                  <span className="text-red-600 dark:text-red-400">{m.theirs}</span>
                  <span className="sr-only">
                    {edge === "up" ? ", you outnumber them" : edge === "down" ? ", they outnumber you" : ", even"}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
            Why {counter} works against {enemy}
          </h1>
          <p className="max-w-[70ch] text-base leading-7 text-stone-700 lg:text-lg lg:leading-8 dark:text-stone-300">{why}</p>
        </div>
      </section>
    </div>
  );
}

function Pitch({
  ally,
  foes,
  allyOnLeft,
  enemy,
  counter,
}: {
  ally: Point[];
  foes: Point[];
  allyOnLeft: boolean;
  enemy: Formation;
  counter: string;
}) {
  const chalk = "#f3f5ee";
  const stripes = 10;
  const stripeWidth = W / stripes;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Soccer field seen from above. Your team in blue plays ${counter} on the ${allyOnLeft ? "left" : "right"}. The opponent in red plays ${enemy} on the ${allyOnLeft ? "right" : "left"}.`}
      className="w-full rounded-xl shadow-lg shadow-stone-900/15"
    >
      <rect width={W} height={H} fill="#2d7a35" />
      {Array.from({ length: stripes }, (_, i) =>
        i % 2 === 0 ? (
          <rect key={i} x={i * stripeWidth} y={0} width={stripeWidth} height={H} fill="#348a3d" />
        ) : null,
      )}

      <g fill="none" stroke={chalk} strokeWidth={4} strokeLinecap="round">
        {/* touchlines and goal lines */}
        <rect x={40} y={40} width={W - 80} height={H - 80} />
        {/* halfway line and center */}
        <line x1={W / 2} y1={40} x2={W / 2} y2={H - 40} />
        <circle cx={W / 2} cy={H / 2} r={75} />
        <circle cx={W / 2} cy={H / 2} r={4} fill={chalk} />
        {/* penalty areas */}
        <rect x={40} y={H / 2 - 165} width={135} height={330} />
        <rect x={W - 40 - 135} y={H / 2 - 165} width={135} height={330} />
        {/* goal areas */}
        <rect x={40} y={H / 2 - 75} width={50} height={150} />
        <rect x={W - 40 - 50} y={H / 2 - 75} width={50} height={150} />
        {/* penalty spots and arcs */}
        <circle cx={40 + 95} cy={H / 2} r={4} fill={chalk} />
        <circle cx={W - 40 - 95} cy={H / 2} r={4} fill={chalk} />
        <path d={`M ${175} ${H / 2 - 52} A 75 75 0 0 1 ${175} ${H / 2 + 52}`} />
        <path d={`M ${W - 175} ${H / 2 - 52} A 75 75 0 0 0 ${W - 175} ${H / 2 + 52}`} />
        {/* corner arcs */}
        <path d={`M 40 ${40 + 18} A 18 18 0 0 0 ${40 + 18} 40`} />
        <path d={`M ${W - 40 - 18} 40 A 18 18 0 0 0 ${W - 40} ${40 + 18}`} />
        <path d={`M 40 ${H - 40 - 18} A 18 18 0 0 1 ${40 + 18} ${H - 40}`} />
        <path d={`M ${W - 40 - 18} ${H - 40} A 18 18 0 0 1 ${W - 40} ${H - 40 - 18}`} />
        {/* goals */}
        <rect x={22} y={H / 2 - 40} width={18} height={80} fill="rgba(255,255,255,0.18)" />
        <rect x={W - 40} y={H / 2 - 40} width={18} height={80} fill="rgba(255,255,255,0.18)" />
      </g>

      <defs>
        <filter id="marker-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>
      <SideLabel left={allyOnLeft} text={`You ${counter}`} chalk={chalk} />
      <SideLabel left={!allyOnLeft} text={`Opponent ${enemy}`} chalk={chalk} />
      <Team points={foes} fill="#dc2626" ring="#fecaca" />
      <Team points={ally} fill="#1d4ed8" ring="#bfdbfe" />
    </svg>
  );
}

function FieldIcon({ w, h }: { w: number; h: number }) {
  const x = (24 - w) / 2;
  const y = (24 - h) / 2;
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <rect x={x} y={y} width={w} height={h} rx={0.75} />
      <line x1={12} y1={y} x2={12} y2={y + h} />
    </svg>
  );
}

function SideLabel({ left, text, chalk }: { left: boolean; text: string; chalk: string }) {
  return (
    <text
      x={left ? 70 : W - 70}
      y={H - 58}
      textAnchor={left ? "start" : "end"}
      fill={chalk}
      fillOpacity={0.6}
      fontSize={30}
      fontWeight={600}
      fontFamily="var(--font-geist-sans), system-ui, sans-serif"
    >
      {left ? `${text} \u2192` : `\u2190 ${text}`}
    </text>
  );
}

function Team({ points, fill, ring }: { points: Point[]; fill: string; ring: string }) {
  return (
    <g filter="url(#marker-shadow)">
      {points.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <circle r={38} fill={fill} stroke={ring} strokeWidth={5} />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="#fff"
            fontSize={28}
            fontWeight={700}
            fontFamily="var(--font-geist-sans), system-ui, sans-serif"
          >
            {p.label}
          </text>
        </g>
      ))}
    </g>
  );
}
