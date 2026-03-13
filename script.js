document.addEventListener('DOMContentLoaded', () => {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const body = document.body;
    const cards = document.querySelectorAll('.link-card');
    const lofiToggle = document.getElementById('lofi-toggle');
    const lofiAudio = document.getElementById('lofi-audio');

    // Trigger Entrance Animations
    setTimeout(() => {
        body.classList.add('loaded');
    }, 100);

    // Global Mouse Interaction (Cursor + Parallax + Torch)
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // 1. Cursor Movement
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });

        // 2. Background Parallax
        const moveX = (posX - window.innerWidth / 2) / 50;
        const moveY = (posY - window.innerHeight / 2) / 50;
        body.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;

        // 3. Torch Effect Variable Update
        body.style.setProperty('--mouse-x', `${posX}px`);
        body.style.setProperty('--mouse-y', `${posY}px`);
    });

    // 4. Magnetic Effect for Cards
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Magnetic attraction (translate) + 3D Tilt
            card.style.transform = `perspective(1200px) translate(${x * 0.2}px, ${y * 0.3}px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1200px) translate(0, 0) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });

    // 5. Lo-Fi Player Logic with Fade-in/out Effects
    let isFadingIn = false;
    let fadeInterval = null;

    const fadeInAudio = () => {
        clearInterval(fadeInterval);
        isFadingIn = true;

        if (lofiAudio.paused) {
            lofiAudio.volume = 0;
            lofiAudio.play().catch(() => { isFadingIn = false; });
        }

        lofiToggle.classList.add('playing');

        fadeInterval = setInterval(() => {
            if (lofiAudio.volume < 0.95) {
                lofiAudio.volume += 0.05;
            } else {
                lofiAudio.volume = 1;
                clearInterval(fadeInterval);
                isFadingIn = false;
            }
        }, 100);
    };

    const fadeOutAudio = (callback) => {
        clearInterval(fadeInterval);
        isFadingIn = false;

        fadeInterval = setInterval(() => {
            if (lofiAudio.volume > 0.05) {
                lofiAudio.volume -= 0.05;
            } else {
                lofiAudio.volume = 0;
                clearInterval(fadeInterval);
                if (!callback) {
                    lofiAudio.pause();
                    lofiToggle.classList.remove('playing');
                }
                if (callback) callback();
            }
        }, 100);
    };

    // Auto Fade-out saat lagu hampir selesai
    lofiAudio.addEventListener('timeupdate', () => {
        const timeLeft = lofiAudio.duration - lofiAudio.currentTime;
        if (timeLeft <= 5 && timeLeft > 4.8 && !lofiAudio.paused && !isFadingIn) {
            fadeOutAudio(() => {
                lofiAudio.currentTime = 0;
                fadeInAudio();
            });
        }
    });

    lofiAudio.addEventListener('ended', () => {
        lofiAudio.currentTime = 0;
        fadeInAudio();
    });

    // Otomatis putar saat dimuat
    fadeInAudio();

    const startOnInteraction = () => {
        if (lofiAudio.paused) {
            fadeInAudio();
            ['click', 'mousedown', 'touchstart', 'keydown'].forEach(env => {
                document.removeEventListener(env, startOnInteraction);
            });
        }
    };

    ['click', 'mousedown', 'touchstart', 'keydown'].forEach(env => {
        document.addEventListener(env, startOnInteraction);
    });

    lofiToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (lofiAudio.paused) {
            fadeInAudio();
        } else {
            fadeOutAudio();
        }
    });

    // Particle Generation
    const container = document.getElementById('particles-container');
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 5 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animationDuration = Math.random() * 10 + 10 + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(particle);
    }

    // Interactive Hover Classes
    const interactive = document.querySelectorAll('a, .profile-img, .lofi-player');
    interactive.forEach(el => {
        el.addEventListener('mouseenter', () => body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => body.classList.remove('cursor-hover'));
    });
});
