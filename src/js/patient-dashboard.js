
    document.addEventListener('DOMContentLoaded', () => {
        const links = document.querySelectorAll('.sidebar a');
        const sections = document.querySelectorAll('.section');
        const buttons = document.querySelectorAll('button[data-target]');

        // Sidebar navigation
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('data-target');
                toggleSection(target);
                activateLink(link);
            });
        });

        // Button actions
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const target = button.getAttribute('data-target');
                toggleSection(target);
            });
        });

        function toggleSection(targetId) {
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        }

        function activateLink(activeLink) {
            links.forEach(link => link.parentElement.classList.remove('active'));
            activeLink.parentElement.classList.add('active');
        }
    });
