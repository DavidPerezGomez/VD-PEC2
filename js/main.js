function openTab(event, tab) {
    Array.from(document.getElementsByClassName("tab_content"))
        .forEach(element => {
            element.className = element.className.replace(" visible", "");
        });
    document.getElementById(tab).className += " visible";

    Array.from(document.getElementById("tab_buttons").children)
        .forEach(button => {
            button.className = button.className.replace(" active", "");
        });
    event.currentTarget.className += " active";
}

dot_density_btn.click();