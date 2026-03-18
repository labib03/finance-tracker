export default function LiquidBackground() {
    return (
        <>
            {/* SVG Gooey Filter for loading states */}
            <svg className="absolute w-0 h-0" aria-hidden="true">
                <defs>
                    <filter id="gooey">
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

            {/* Floating liquid blobs */}
            <div className="liquid-bg" aria-hidden="true">
                <div className="liquid-blob liquid-blob-1" />
                <div className="liquid-blob liquid-blob-2" />
                <div className="liquid-blob liquid-blob-3" />
            </div>
        </>
    );
}
