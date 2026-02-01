import ParaphraserForm from "@/components/paraphraser-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            AI Paraphraser
          </h1>
          <p className="mt-2 text-muted-foreground">
            Paste your text, choose a rewrite style, and get a paraphrased
            version from AI.
          </p>
        </div>
        <ParaphraserForm />
      </main>
    </div>
  );
}
