export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Firefly Next" className="h-10 w-auto" />
          <h1 className="text-xl font-semibold text-primary">Firefly Next</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
