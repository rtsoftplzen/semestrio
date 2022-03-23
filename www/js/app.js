document.addEventListener('DOMContentLoaded', naja.initialize.bind(naja));

const elements = document.querySelectorAll('[data-cell="is-exam"]');


elements.forEach(element => {
    element.addEventListener('click', async function (e) {
        const id = e.target.getAttribute("data-id");

        fetch('/api/change-state', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        })
            .then(response => response.json())
            .then(data => {
                const icon = document.getElementById(`i-${id}`);

                if (data.newState == 1) {
                    icon.classList.remove('glyphicon-remove');
                    icon.classList.add('glyphicon-ok');
                } else {
                    icon.classList.remove('glyphicon-ok');
                    icon.classList.add('glyphicon-remove');
                }
            });
    });
})
