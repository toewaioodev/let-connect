import { Shield } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-indigo-600 text-white">
                <Shield className="size-5" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-lg tracking-tight text-indigo-500 dark:text-indigo-400">
                    LetConnect
                </span>
            </div>
        </>
    );
}
