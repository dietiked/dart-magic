import pkg from "../../../package.json"

export function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-muted-foreground">
      Dart Magic v{pkg.version} · {process.env.APP_COMMIT_SHA}
    </footer>
  )
}
