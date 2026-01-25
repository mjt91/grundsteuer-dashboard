export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Grundsteuer Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Property tax calculation and visualization
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Calculate</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter property details to calculate tax
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Visualize</h2>
            <p className="text-gray-600 dark:text-gray-400">
              View charts and trends
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">History</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track calculations over time
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
