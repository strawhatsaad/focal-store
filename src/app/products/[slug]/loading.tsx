export default function Loading() {
  return (
    <main className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
        <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-24 w-full bg-gray-200 rounded animate-pulse mt-4" />
          <div className="h-12 w-full bg-gray-200 rounded animate-pulse mt-6" />
          <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </main>
  );
}
