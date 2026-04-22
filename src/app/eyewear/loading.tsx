export default function Loading() {
  return (
    <main className="container py-8">
      <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <div className="hidden md:flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
