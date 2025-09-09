// Dynamic blog post page. This component uses the slug from the URL to
// display a specific blog post. Currently it renders placeholder content.
interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Blog Post: {params.slug}</h1>
      <p className="text-base">
        This is a placeholder for the blog content associated with the slug "{params.slug}".
      </p>
    </main>
  );
}