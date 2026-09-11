import React, {
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import './CarouselSqueeze.css';

/* -------------------------------------------------------------------------- */
/*                                  geometry                                  */
/* -------------------------------------------------------------------------- */

const size = (value) => (typeof value === "number" ? `${value}px` : value);

const clamp = (value, low, high) =>
    Math.max(low, Math.min(high, value));

const SHARES = [-0.06, 0.61, 0.3, 0.15];
const STRETCHED = [0, 0.71, 0.4, 0.25];
const SQUEEZED = [-0.12, 0.59, 0.28, 0.13];

/* -------------------------------------------------------------------------- */
/*                                    hooks                                   */
/* -------------------------------------------------------------------------- */

function useReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia("(prefers-reduced-motion: reduce)");
        const read = () => setReduced(query.matches);
        read();
        query.addEventListener("change", read);
        return () => query.removeEventListener("change", read);
    }, []);

    return reduced;
}

/* -------------------------------------------------------------------------- */
/*                                 component                                  */
/* -------------------------------------------------------------------------- */

export function SqueezeCarousel({
    slides = [],
    defaultIndex = 0,
    onIndexChange,
    height = "clamp(180px, 32cqi, 340px)",
    slatWidth = 8,
    slatGap = 8,
    gap = 16,
    radius = 0,
    duration = 1000,
    hoverGrow = true,
    autoplay = false,
    interval = 6000,
    controls = true,
    accent = "var(--color-heading-text, #000)",
    accentForeground = "var(--color-primary-bg, #fff)",
    label = "Featured",
    panelClassName = "",
    className = "",
    style = {},
    ...props
}) {
    const count = slides.length;
    const wrap = (i) => ((i % count) + count) % count;

    const slats = clamp(count - 4, 1, 3);
    const visible = 4 + slats;

    const reduced = useReducedMotion();
    const ms = reduced ? 0 : duration;

    const ids = useId();
    const seed = useRef(0);
    const strip = useRef(null);

    const window0 = () =>
        Array.from({ length: visible }, (_, p) => ({
            key: seed.current++,
            slide: wrap(defaultIndex + p),
        }));

    const [cards, setCards] = useState(window0);
    const [column, setColumn] = useState(0);
    const columnRef = useRef(0);
    const forward = useRef(true);
    const [slid, setSlid] = useState(0);
    const [still, setStill] = useState(false);
    const [hover, setHover] = useState(-1);

    const open = cards[-column]?.slide ?? defaultIndex;
    const timers = useRef([]);

    useEffect(() => () => timers.current.forEach(clearTimeout), []);

    const settle = useCallback(() => {
        setCards((stripArr) =>
            forward.current ? stripArr.slice(-visible) : stripArr.slice(0, visible)
        );
        columnRef.current = 0;
        setColumn(0);
        setSlid(0);
        setStill(true);
    }, [visible]);

    useLayoutEffect(() => {
        if (!still) return;
        const id = requestAnimationFrame(() => setStill(false));
        return () => cancelAnimationFrame(id);
    }, [still]);

    const step = useCallback(
        (by) => {
            if (count < 2 || by === 0) return;

            timers.current.forEach(clearTimeout);
            timers.current = [];
            forward.current = by > 0;

            if (by > 0) {
                setCards((stripArr) => [
                    ...stripArr,
                    ...Array.from({ length: by }, (_, k) => ({
                        key: seed.current++,
                        slide: wrap(stripArr[stripArr.length - 1].slide + 1 + k),
                    })),
                ]);
                columnRef.current -= by;
                setColumn(columnRef.current);
                setSlid((s) => s - by);
            } else {
                setCards((stripArr) => [
                    ...Array.from({ length: -by }, (_, k) => ({
                        key: seed.current++,
                        slide: wrap(stripArr[0].slide - (-by - k)),
                    })),
                    ...stripArr,
                ]);
                setSlid((s) => s + by);
                setStill(true);
                timers.current.push(window.setTimeout(() => setSlid(0), 0));
            }

            timers.current.push(window.setTimeout(settle, ms + 20));
        },
        [count, ms, settle, wrap]
    );

    useEffect(() => {
        if (onIndexChange) onIndexChange(open);
    }, [open, onIndexChange]);

    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (!autoplay || paused || reduced || count < 2) return;
        const timer = window.setTimeout(() => step(1), interval);
        return () => clearTimeout(timer);
    }, [autoplay, paused, reduced, count, open, interval, step]);

    const onKeyDown = (event) => {
        const moves = { ArrowRight: 1, ArrowLeft: -1 };
        const by = moves[event.key];
        if (by === undefined) return;
        event.preventDefault();
        step(by);
    };

    if (!count) return null;

    const slat = size(slatWidth);
    const shares = hoverGrow && hover >= 0 && hover <= 3 && !reduced ? null : SHARES;

    const shareOf = (col) => {
        if (shares) return SHARES[col];
        return hover === col ? STRETCHED[col] : SQUEEZED[col];
    };

    const widthOf = (col) => {
        if (col < 0 || col > 3) return slat;
        if (col === 0) return `calc(var(--sq-hero) + var(--sq-room) * ${shareOf(0)})`;
        return `calc(var(--sq-room) * ${shareOf(col)})`;
    };

    const vars = {
        "--sq-h": size(height),
        "--sq-gap": size(gap),
        "--sq-slat-gap": size(slatGap),
        "--sq-radius": size(radius),
        "--sq-ms": `${ms}ms`,
        "--sq-ease": "cubic-bezier(0.16, 1, 0.3, 1)",
        "--sq-fill": accent,
        "--sq-on-fill": accentForeground,
        "--sq-gaps": `calc(${slats} * var(--sq-slat-gap) + 3 * var(--sq-gap) + ${slats} * ${slat})`,
        "--sq-hero": "min(calc(var(--sq-h) * 16 / 9), calc(100cqi - var(--sq-gaps) - 60px))",
        "--sq-room": `calc(100cqi - var(--sq-hero) - var(--sq-gaps))`,
    };

    const move = `translateX(calc(${slid} * (${slat} + var(--sq-gap))))`;

    return (
        <div
            className={`sq-carousel ${className}`}
            style={{
                containerType: "inline-size",
                fontFamily: 'var(--font-body)',
                ...vars,
                ...style,
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => {
                setPaused(false);
                setHover(-1);
            }}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            {...props}
        >
            {controls && count > 1 && (
                <div className="sq-controls">
                    <Arrow back label="Previous" onClick={() => step(-1)} />
                    <Arrow label="Next" onClick={() => step(1)} />
                </div>
            )}

            <div className="sq-viewport" style={{ height: "var(--sq-h)" }}>
                <div
                    ref={strip}
                    role="tablist"
                    aria-label={label}
                    aria-orientation="horizontal"
                    onKeyDown={onKeyDown}
                    className="sq-strip"
                    style={{
                        transform: move,
                        transition: still ? "none" : `transform var(--sq-ms) var(--sq-ease)`,
                    }}
                >
                    {cards.map((card, place) => {
                        const col = place + column;
                        const slide = slides[card.slide];
                        const front = col === 0;

                        return (
                            <button
                                key={card.key}
                                type="button"
                                role="tab"
                                id={`${ids}-tab-${card.key}`}
                                aria-selected={front}
                                aria-controls={`${ids}-panel`}
                                aria-label={slide.title}
                                tabIndex={front ? 0 : -1}
                                onMouseMove={() => hoverGrow && setHover(col)}
                                onClick={() => col > 0 && step(col)}
                                className={`sq-tab ${panelClassName}`}
                                style={{
                                    width: widthOf(col),
                                    marginLeft:
                                        place === 0
                                            ? 0
                                            : col < 4
                                                ? "var(--sq-gap)"
                                                : "var(--sq-slat-gap)",
                                    borderRadius: `min(var(--sq-radius), calc(${widthOf(col)} / 2))`,
                                    transitionProperty: "width, margin-left",
                                    transitionDuration: still ? "0s" : "var(--sq-ms)",
                                    transitionTimingFunction: "var(--sq-ease)",
                                }}
                            >
                                <Picture slide={slide} />

                                {slide.overlay && (
                                    <span
                                        aria-hidden="true"
                                        className="sq-overlay"
                                        style={{
                                            opacity: front ? 1 : 0,
                                            transition: `opacity var(--sq-ms) var(--sq-ease)`,
                                            backgroundImage:
                                                "linear-gradient(to top, rgb(0 0 0 / 0.55), transparent)",
                                        }}
                                    >
                                        {slide.overlay}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div id={`${ids}-panel`} role="tabpanel" aria-live="polite" className="sq-panel-container">
                {slides.map((slide, i) => {
                    const shown = i === open;

                    return (
                        <div
                            key={slide.id ?? i}
                            aria-hidden={!shown}
                            className="sq-panel"
                            style={{
                                opacity: shown ? 1 : 0,
                                visibility: shown ? "visible" : "hidden",
                                pointerEvents: shown ? "auto" : "none",
                                transition: `opacity var(--sq-ms) var(--sq-ease), visibility var(--sq-ms)`,
                            }}
                        >
                            <div style={{ maxWidth: '46rem' }}>
                                <h3 style={{ margin: 0, color: 'var(--color-heading-text)', fontFamily: 'var(--font-heading)' }}>
                                    {slide.title}
                                </h3>
                                {slide.description && (
                                    <p className="sq-desc" style={{ color: 'var(--color-body-text)', marginTop: '10px', fontFamily: 'var(--font-body)' }}>
                                        {slide.description}
                                    </p>
                                )}
                            </div>

                            {slide.action && <Action slide={slide} shown={shown} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Picture({ slide }) {
    const box = {
        width: "var(--sq-hero)",
        minWidth: "100%",
    };

    if (slide.image) {
        return (
            <img
                src={slide.image}
                alt={slide.imageAlt ?? ""}
                draggable={false}
                className="sq-picture"
                style={box}
            />
        );
    }

    return (
        <span
            aria-hidden="true"
            className="sq-picture"
            style={{ background: slide.background, ...box }}
        />
    );
}

function Arrow({ back = false, label, onClick }) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className="sq-arrow"
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path
                    d={
                        back
                            ? "M9.6 2.6 5.1 7.1h9.1v1.8H5.1l4.5 4.5-1.2 1.2-6-6L1.8 8l.6-.6 6-6 1.2 1.2Z"
                            : "M6.4 2.6l4.5 4.5H1.8v1.8h9.1l-4.5 4.5 1.2 1.2 6-6 .6-.6-.6-.6-6-6-1.2 1.2Z"
                    }
                />
            </svg>
        </button>
    );
}

function Action({ slide, shown }) {
    if (slide.href) {
        return (
            <a
                href={slide.href}
                target={slide.target}
                rel={slide.target === "_blank" ? "noreferrer" : undefined}
                tabIndex={shown ? 0 : -1}
                onClick={slide.onAction}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start' }}
            >
                {slide.action}
            </a>
        );
    }

    return (
        <button type="button" tabIndex={shown ? 0 : -1} onClick={slide.onAction} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            {slide.action}
        </button>
    );
}

export default SqueezeCarousel;
