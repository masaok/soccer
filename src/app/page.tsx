import FormationCounter from "@/components/formation-counter";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-stone-50 font-sans text-stone-900 dark:bg-stone-950 dark:text-stone-50">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-14">
        <FormationCounter />
      </main>
    </div>
  );
}
