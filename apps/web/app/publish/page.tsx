// A simple publish demonstration page within the portal. This page
// illustrates how a publish form might look. It uses the existing UI
// primitives (Button, Select, FormField, Input) to present the user with
// options for choosing an audience and specifying additional data like
// blog slug. The form does not persist data; it simply logs the
// selected values.
'use client';

import { useState } from 'react';
// The UI primitives are imported from the local monorepo package. Relative
// paths are used here because there are no module aliases configured. The
// current file lives at `apps/web/app/(portal)/publish/page.tsx`, so to
// reach `packages/web-ui/src` we need to traverse up five directories.
import { Button, Select, FormField, Input } from '@ria/web-ui';

// Available publish audience options; the values correspond to the
// AudienceKind enum defined in the Prisma schema.
const audienceOptions = [
  { value: 'only_me', label: 'Only me' },
  { value: 'users', label: 'Specific users' },
  { value: 'groups', label: 'Specific groups' },
  { value: 'internal_all', label: 'All internal users' },
  { value: 'clients_all', label: 'All client users' },
  { value: 'public', label: 'Public' },
];

export default function PublishPage() {
  const [audience, setAudience] = useState<string>('internal_all');
  const [userIds, setUserIds] = useState<string>('');
  const [groupIds, setGroupIds] = useState<string>('');
  const [blogSlug, setBlogSlug] = useState<string>('');
  const [showAsBlog, setShowAsBlog] = useState<boolean>(false);

  const handlePublish = () => {
    // In a real implementation, you would call an API to create a Publication
    // record with the selected audience and associated values. For now we
    // simply log the selected data to the console.
    console.log({ audience, userIds, groupIds, blogSlug, showAsBlog });
    alert('Publish event logged to console');
  };

  // Determine if we need to show the userIds or groupIds field based on
  // the selected audience.
  const showUserField = audience === 'users';
  const showGroupField = audience === 'groups';
  const allowBlog = audience === 'public' || audience === 'clients_all';

  return (
    <main className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold">Publish Demo</h1>
      <p className="text-sm text-inactive">
        This demo form illustrates how a publish dialog might capture
        audience and blog settings. It does not persist data.
      </p>
      <div className="space-y-4">
        <FormField label="Audience">
          <Select
            options={audienceOptions}
            value={audience}
            onChange={(e: any) => setAudience(e.target.value)}
          />
        </FormField>
        {showUserField && (
          <FormField label="User Membership IDs" hint="Comma-separated membership IDs">
            <Input
              value={userIds}
              onChange={(e: any) => setUserIds(e.target.value)}
              placeholder="uuid1, uuid2"
            />
          </FormField>
        )}
        {showGroupField && (
          <FormField label="Group IDs" hint="Comma-separated group IDs">
            <Input
              value={groupIds}
              onChange={(e: any) => setGroupIds(e.target.value)}
              placeholder="group1, group2"
            />
          </FormField>
        )}
        {allowBlog && (
          <FormField label="Show as Blog">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showAsBlog"
                checked={showAsBlog}
                onChange={(e) => setShowAsBlog(e.target.checked)}
              />
              <label htmlFor="showAsBlog" className="select-none">Publish to blog</label>
            </div>
            {showAsBlog && (
              <div className="mt-2">
                <Input
                  value={blogSlug}
                  onChange={(e: any) => setBlogSlug(e.target.value)}
                  placeholder="Slug for the blog post (e.g. my-first-post)"
                />
              </div>
            )}
          </FormField>
        )}
        <div className="pt-4">
          <Button onClick={handlePublish}>Publish</Button>
        </div>
      </div>
    </main>
  );
}