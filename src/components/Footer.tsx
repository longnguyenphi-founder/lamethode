async function CurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

export default async function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <p className="font-serif text-base text-foreground">La Methode</p>
        <p>© {await CurrentYear()} La Methode. All rights reserved.</p>
      </div>
    </footer>
  );
}
