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
}


menu_btn.addEventListener("click", ()  => {

    let sidebar = document.getElementById("sidebar");
    let curr_menu_width = sidebar.offsetWidth;

    // main page element
    let main = document.getElementById("main");

    console.log(curr_menu_width);

    // show menu if currently hidden, hide menu if currently displayed
    if (curr_menu_width === 0)
    {
        sidebar.style.width = pixel_width + "px";
        main.style.marginLeft = pixel_width + "px";
    }
    else
    {
        sidebar.style.width = 0 + "px";
        main.style.marginLeft = 0 + "px";
    }
})