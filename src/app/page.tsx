"use client";
import NavMenu from './component/NavMenu';

export default function Home() {
    return (
        <div className="grid grid-cols-[256px_1fr] min-h-screen">
            <div className="h-full">
                <NavMenu />
            </div>
            <div>
                {/* 这里可以放置其他内容 */}
            </div>
        </div>
    );
}