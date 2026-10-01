export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">SecuriApp</h1>
      <p>Système de vérification d&apos;identité des agents de sécurité.</p>
      <a href="/admin" className="text-blue-600 underline mt-4 inline-block">
        Aller à l&apos;administration
      </a>
    </div>
  );
}