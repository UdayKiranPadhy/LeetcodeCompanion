import React, { useEffect, useRef } from 'react';

export function HeroBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            const { clientX, clientY } = e;
            const { left, top, width, height } = containerRef.current.getBoundingClientRect();

            // Calculate mouse position relative to container
            const x = clientX - left;
            const y = clientY - top;

            // Parallax effect offset (subtle movement)
            // Moving background slightly opposite to mouse
            const sensitivity = 0.05;
            const moveX = (window.innerWidth / 2 - clientX) * sensitivity;
            const moveY = (window.innerHeight / 2 - clientY) * sensitivity;

            containerRef.current.style.setProperty('--mouse-x', `${x}px`);
            containerRef.current.style.setProperty('--mouse-y', `${y}px`);
            containerRef.current.style.setProperty('--bg-x', `${moveX}px`);
            containerRef.current.style.setProperty('--bg-y', `${moveY}px`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={containerRef}
            className="hero-bg"
            aria-hidden="true"
        />
    );
}
