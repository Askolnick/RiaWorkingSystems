import '../globals.css';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bg text-text">{children}</div>;
}
