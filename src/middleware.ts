import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// 滑动窗口限流器
const rateLimiter = new Map<string, {
    count: number
    resetTime: number
}>()

const isPublicRoute = createRouteMatcher(['/sign-in(.*)'])

export default clerkMiddleware(async (auth, req) => {
    // 当需要限流的路径
    if (req.nextUrl.pathname.startsWith('/api')) {
        const clientIp = req.headers.get('x-real-ip') ||
            req.headers.get('x-forwarded-for') ||
            '0.0.0.0'
        console.log(clientIp)
        const windowMs = 60_000 // 1分钟
        const max = 10          // 最大请求数

        const limitKey = `ratelimit_${clientIp}`

        const current = rateLimiter.get(limitKey) || { count: 0, resetTime: Date.now() + windowMs }

        if (Date.now() > current.resetTime) {
            rateLimiter.delete(limitKey)
        } else if (++current.count > max) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }
        rateLimiter.set(limitKey, current)
    }

    // 原clerk逻辑...
    if (!isPublicRoute(req)) {
        await auth.protect()
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}