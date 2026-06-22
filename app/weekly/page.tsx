import Link from 'next/link'
import { fetchWeeklyReviews } from '@/lib/notion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default async function WeeklyPage() {
  const reviews = await fetchWeeklyReviews(10)

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold tracking-tight">Weekly Reviews</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Today
          </Link>
        </div>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">
                No weekly reviews yet. Complete at least one drill session and trigger a review via{' '}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">POST /api/weekly-review</code>.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const scoreColor = review.avgScore >= 7 ? 'text-green-600' : review.avgScore >= 5 ? 'text-yellow-600' : 'text-red-500'
              return (
                <Card key={review.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{review.weekLabel}</span>
                      {review.avgScore > 0 && (
                        <span className={`text-lg font-bold ${scoreColor}`}>{review.avgScore}/10</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-3">
                    {review.focusNextWeek && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-purple-700 mb-1">Focus next week</p>
                        <p className="text-sm font-medium">{review.focusNextWeek}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('en-AU', {
                        weekday: 'short', day: 'numeric', month: 'short',
                      })}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-muted-foreground">
            Weekly reviews are generated automatically each Friday via cron, or manually via{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">POST /api/weekly-review</code>.
          </p>
        </div>
      </div>
    </main>
  )
}
