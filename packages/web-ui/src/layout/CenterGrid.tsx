import Link from 'next/link';

export type FeatureStatus = 'now' | 'next' | 'later';

export interface Feature {
  key: string;
  name: string;
  status: FeatureStatus;
  routes: { path: string; name: string }[];
}

export interface Center {
  key: string;
  name: string;
  features: Feature[];
}

interface CenterGridProps {
  centers: Center[];
  className?: string;
  maxFeatureLabels?: number;
}

export function CenterGrid({ 
  centers, 
  className = "",
  maxFeatureLabels = 3
}: CenterGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {centers.map(center => {
        const availableFeatures = center.features.filter(f => f.status === 'now');
        const firstFeature = availableFeatures[0];
        const href = firstFeature?.routes?.[0]?.path ?? `/${center.key}`;
        
        return (
          <Link 
            key={center.key} 
            href={href as any} 
            className="block rounded-2xl bg-bg-elev-1 border border-border shadow-sm p-6 hover:shadow-md hover:bg-bg-elev-2 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm text-text-muted font-medium">
                {center.name}
              </div>
              {availableFeatures.length > 0 && (
                <div className="w-2 h-2 bg-theme rounded-full" title="Available now" />
              )}
            </div>
            
            <div className="text-lg font-semibold text-text mb-2">
              {availableFeatures.length} feature{availableFeatures.length !== 1 ? 's' : ''} available
            </div>
            
            <div className="text-sm text-text-muted">
              {center.features.length - availableFeatures.length > 0 && (
                <span>
                  +{center.features.length - availableFeatures.length} coming soon
                </span>
              )}
            </div>
            
            {availableFeatures.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {availableFeatures.slice(0, maxFeatureLabels).map(feature => (
                  <span 
                    key={feature.key}
                    className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-theme-subtle text-theme"
                  >
                    {feature.name}
                  </span>
                ))}
                {availableFeatures.length > maxFeatureLabels && (
                  <span className="text-xs text-text-muted">
                    +{availableFeatures.length - maxFeatureLabels} more
                  </span>
                )}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}