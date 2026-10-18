/**
 * Page metadata for the story, ready for the swap: when "Across the Street"
 * becomes the default for /thoughts/sunday-morning, spread this into that
 * route's generateMetadata (app/thoughts/[slug]/page.tsx). It is not wired
 * yet so the default experience stays unchanged while the story is flagged.
 */
import beats from './content/beats.json'

const description = 'A scroll-told, illustrated story: one Sunday morning, a spilled coffee, and the man pacing beneath the window of the flat Marcus left behind.'

export const storyMetadata = {
  title: `${beats.title} · thoughts`,
  description,
  openGraph: {
    title: beats.title,
    description,
    type: 'article',
    images: [{ url: '/stories/across-the-street/og.png', width: 1200, height: 630, alt: 'A pixel drawing of Marcus at his window with a coffee, the old building across the road' }],
  },
  twitter: { card: 'summary_large_image', title: beats.title, description, images: ['/stories/across-the-street/og.png'] },
} as const
