import { NextResponse } from 'next/server';

export function middleware() {
    // i18nルーティングは現状未使用のため透過させる
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|api|.*\\..*).*)']
};
