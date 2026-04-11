// menu pixel width when open
const pixel_width = 200;

// respond to menu button upon click
const menu_btn = document.getElementById("menu_btn");

// initialize menu
init_menu()
function init_menu() {
    // activate the menu upon page load, menu display is in
    let sidebar = document.getElementById("sidebar");
    sidebar.style.width = pixel_width + "px";
    main.style.marginLeft = pixel_width + "px";
    document.body.classList.add("menu-open"); // show controls in correct position on page load
}


menu_btn.addEventListener("click", ()  => {

    let sidebar = document.getElementById("sidebar");
    let curr_menu_width = sidebar.offsetWidth;

    // main page element
    let main = document.getElementById("main");

    // show menu if currently hidden, hide menu if currently displayed
    if (curr_menu_width === 0)
    {
        sidebar.style.width = pixel_width + "px";
        main.style.marginLeft = pixel_width + "px";
        document.body.classList.add("menu-open"); // add class to trigger CSS for map control shifting
    }
    else
    {
        sidebar.style.width = 0 + "px";
        main.style.marginLeft = 0 + "px";
        document.body.classList.remove("menu-open");
    }
})

// adjust map controls in both maps when entering/exiting fullscreen mode (previously floating when menu open)
document.addEventListener('fullscreenchange', () => {
    const controls = document.querySelector('.mapboxgl-ctrl-top-right');
    if (!controls) return;

    if (document.fullscreenElement) {
        controls.style.transition = 'none';   // stop transition
        controls.style.right = '10px';        // place in corner
    } else {
        controls.style.transition = 'none';   // stop transition

        if (document.body.classList.contains('menu-open')) {
            controls.style.right = '210px';
        } else {
            controls.style.right = '10px';
        }

        // re-enable transition after position is set
        setTimeout(() => {
            controls.style.transition = 'right 0.5s';
        }, 0);
    }
});
