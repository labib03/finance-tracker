export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
            {/* SVG Gooey Filter */}
            <svg className="absolute w-0 h-0" aria-hidden="true">
                <defs>
                    <filter id="gooey-loading">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                            result="gooey"
                        />
                        <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
                    </filter>
                </defs>
            </svg>

            <div className="loading-gooey" style={{ filter: 'url(#gooey-loading)' }}>
                <div className="loading-gooey-dot" />
                <div className="loading-gooey-dot" />
                <div className="loading-gooey-dot" />
            </div>

            <p
                className="mt-6 text-sm font-medium tracking-wide"
                style={{ color: 'var(--text-muted)' }}
            >
                Memuat data keuangan...
            </p>
        </div>
    );
}
