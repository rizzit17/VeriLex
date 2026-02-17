// VeriLex Logo Component - Professional legal-themed logo
export default function VeriLexLogo({ size = 32 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Shield background */}
            <path
                d="M24 4L8 10V20C8 30 14 38 24 44C34 38 40 30 40 20V10L24 4Z"
                fill="url(#goldGradient)"
                opacity="0.15"
            />
            <path
                d="M24 4L8 10V20C8 30 14 38 24 44C34 38 40 30 40 20V10L24 4Z"
                stroke="url(#goldGradient)"
                strokeWidth="1.5"
                fill="none"
            />

            {/* Scales of justice */}
            {/* Left scale */}
            <path
                d="M16 22L12 26H20L16 22Z"
                fill="#d4a574"
                stroke="#b8860b"
                strokeWidth="1"
            />
            {/* Right scale */}
            <path
                d="M32 22L28 26H36L32 22Z"
                fill="#d4a574"
                stroke="#b8860b"
                strokeWidth="1"
            />
            {/* Balance beam */}
            <line
                x1="16"
                y1="22"
                x2="32"
                y2="22"
                stroke="#d4a574"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            {/* Center post */}
            <line
                x1="24"
                y1="16"
                x2="24"
                y2="22"
                stroke="#d4a574"
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            {/* Gradient definition */}
            <defs>
                <linearGradient id="goldGradient" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#d4a574" />
                    <stop offset="100%" stopColor="#b8860b" />
                </linearGradient>
            </defs>
        </svg>
    );
}
