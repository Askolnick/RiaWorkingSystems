import CenterGrid from '../../_components/CenterGrid';

export default function CentersPage() {
  return (
    <main className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold text-text">All Centers</h1>
        <p className="text-text-muted">
          Explore all available feature centers in your workspace. Each center groups related functionality to help you stay organized and productive.
        </p>
      </div>
      
      <CenterGrid />
      
      <div className="mt-8 p-6 rounded-2xl bg-bg-elev-1 border border-border">
        <h2 className="text-lg font-medium text-text mb-2">Coming Soon</h2>
        <p className="text-text-muted text-sm">
          More centers and features are being actively developed. Features marked as "coming soon" will be available in upcoming releases.
        </p>
      </div>
    </main>
  );
}