// include.js — industry-standard HTML partial loader
document.addEventListener("DOMContentLoaded", () => {

    const loadPartial = async (selector, file, callback) => {
        const el = document.querySelector(selector);
        if (!el) return;

        try {
            const res = await fetch(file);
            el.innerHTML = await res.text();

            if (callback) callback(); // run logic after HTML injection
            document.dispatchEvent(new CustomEvent("partial:loaded", {
                detail: { selector, file }
            }));
        } catch (err) {
            console.error(`Failed to load ${file}`, err);
        }
    };

    // Load Navbar + Attach Logic
    loadPartial("#navbar", "partials/navbar.html", () => {

        const toggle = document.querySelector(".nav-toggle");
        const nav = document.querySelector(".navbar-nav");
        const links = document.querySelectorAll(".nav-link");

        if (!toggle || !nav) return;

        toggle.addEventListener("click", () => {
            const isOpen = nav.classList.toggle("active");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });

        links.forEach(link => {
            link.addEventListener("click", () => {
                nav.classList.remove("active");
                toggle.setAttribute("aria-expanded", "false");
            });
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth >= 768) {
                nav.classList.remove("active");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    });

    // Load Footer
    loadPartial("#footer", "partials/footer.html", () => {
        const yearEl = document.getElementById("current-year");
        if (yearEl) {
            yearEl.textContent = new Date().getUTCFullYear();
        }
    });
});
