import React, { useState, useEffect } from 'react'
import { Sparkles, X, Globe, Copy, Check, ChevronRight } from 'lucide-react'
import { WorldQuote } from '@/lib/quotes'

interface QuoteNotificationToastProps {
  quote: WorldQuote | null
  onClose: () => void
  onNextQuote?: () => void
}

export const QuoteNotificationToast: React.FC<QuoteNotificationToastProps> = ({
  quote,
  onClose,
  onNextQuote,
}) => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!quote) return
    // Auto dismiss after 14 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 14000)
    return () => clearTimeout(timer)
  }, [quote, onClose])

  if (!quote) return null

  const isRtl = quote.language === 'Arabic' || quote.language === 'Persian'

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    const text = `"${quote.original}" (${quote.language})\n${quote.translation}\n— ${quote.author} (${quote.culture})`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#121215]/95 backdrop-blur-md border-2 border-neon-cyan shadow-[0_0_30px_rgba(34,211,238,0.35)] p-4 relative overflow-hidden">
        {/* Pixel corner accents */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-neon-pink shadow-[0_0_8px_#ec4899]" />

        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-neon-cyan/30">
          <div className="flex items-center space-x-2">
            <span className="text-base">{quote.flag}</span>
            <span className="font-pixel text-[9px] text-neon-cyan tracking-wider uppercase">
              WORLD WISDOM // [{quote.language}]
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleCopy}
              className="p-1 text-muted-foreground hover:text-neon-cyan transition-colors cursor-pointer"
              title="Copy Quote"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {onNextQuote && (
              <button
                onClick={onNextQuote}
                className="p-1 text-muted-foreground hover:text-neon-cyan transition-colors cursor-pointer"
                title="Next Quote"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Original Script */}
        <div className="mb-2">
          <p
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`text-foreground font-bold leading-relaxed tracking-wide ${
              isRtl
                ? 'font-serif text-lg text-neon-yellow text-right'
                : 'text-sm sm:text-base text-foreground font-medium'
            }`}
          >
            "{quote.original}"
          </p>

          {quote.transliteration && (
            <p className="text-[10px] text-neon-cyan/80 font-mono italic mt-0.5">
              {quote.transliteration}
            </p>
          )}
        </div>

        {/* Translation */}
        <p className="text-xs text-muted-foreground font-mono leading-relaxed mb-2.5 border-l-2 border-neon-pink/70 pl-2.5">
          {quote.translation}
        </p>

        {/* Footer: Author & Origin */}
        <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground pt-2 border-t border-border">
          <span className="text-foreground font-bold">
            — {quote.author}
          </span>
          <span className="text-neon-pink/90 uppercase font-semibold">
            {quote.culture}
          </span>
        </div>
      </div>
    </div>
  )
}

