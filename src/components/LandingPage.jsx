export default function LandingPage({
  onGetStarted,
  onUploadMaterial,
  onViewDemo,
}) {
  const features = [
    {
      title: "AI Content Analysis",
      desc: "Extracts key concepts, definitions, and learning objectives from your materials.",
    },
    {
      title: "Game Generation",
      desc: "Automatically converts content into quizzes, puzzles, flashcards, and more.",
    },
    {
      title: "Adaptive Learning",
      desc: "Difficulty adjusts based on user performance and progress.",
    },
    {
      title: "Progress Tracking",
      desc: "Monitor performance and improvement over time.",
    },
    {
      title: "Multiple Game Modes",
      desc: "Memory games, battles, matching, adventure-style learning.",
    },
    {
      title: "Personalized Experience",
      desc: "Every game is built from your own uploaded study material.",
    },
  ];

  const audience = [
    "School Students",
    "University Students",
    "Teachers",
    "Tutors",
    "Self Learners",
  ];

  return (
    <div className="w-full space-y-10">
      <section className="px-6 py-16 text-center max-w-6xl mx-auto">
        <div className="text-sm text-primary uppercase tracking-[0.35em] mb-6 font-black">
          Learn Better. Play Smarter.
        </div>
        <h1 className="text-5xl font-black tracking-tight text-text-main sm:text-6xl">
          Turn study materials into interactive learning games.
        </h1>
        <p className="mt-6 text-lg text-text-muted max-w-3xl mx-auto leading-relaxed">
          EduPlay uses AI to transform textbooks, notes, and PDFs into engaging
          quizzes, puzzles, and memory games that help learners retain knowledge
          faster.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onUploadMaterial}
            className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover transition"
          >
            Upload Material
          </button>
          <button
            onClick={onViewDemo}
            className="px-6 py-3 rounded-xl border border-outline text-text-main bg-surface hover:border-primary transition"
          >
            View Demo
          </button>
        </div>
      </section>

      <section
        id="features"
        className="px-6 py-20 bg-surface-container rounded-4xl shadow-sm"
      >
        <h2 className="text-3xl font-black text-center mb-12 text-text-main">
          Core Features
        </h2>
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-surface border border-outline rounded-3xl shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold text-xl mb-3 text-text-main">
                {feature.title}
              </h3>
              <p className="text-text-muted text-sm leading-6">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12 text-text-main">
          How It Works
        </h2>
        <div className="space-y-6">
          {[
            "Upload your study material (PDFs, notes, textbooks)",
            "AI analyzes and extracts key knowledge",
            "System generates interactive educational games",
            "You play, learn, and track your progress",
          ].map((step, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white grid place-items-center font-black">
                {index + 1}
              </div>
              <p className="text-text-main text-base leading-7">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="audience"
        className="px-6 py-20 bg-surface-container rounded-4xl shadow-sm"
      >
        <h2 className="text-3xl font-black text-center mb-10 text-text-main">
          Built For
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {audience.map((item, index) => (
            <span
              key={index}
              className="px-5 py-2 bg-surface border border-outline rounded-full text-sm text-text-main"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 text-center">
        <h2 className="text-4xl font-black text-text-main">
          Start Learning Through Play
        </h2>
        <p className="mt-4 text-text-muted max-w-2xl mx-auto leading-relaxed">
          Upload your first material and let AI turn it into a game.
        </p>
        <button
          onClick={onGetStarted}
          className="mt-8 px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition"
        >
          Get Started
        </button>
      </section>
    </div>
  );
}
