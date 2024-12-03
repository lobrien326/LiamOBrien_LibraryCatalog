//window.addEventListener("DOMContentLoaded", applyLogin);
//window.addEventListener("input", prepareStatblock);

/*So, I didn't end up doing much here. I had a few other ideas, but they didn't work out. Ultimately I just used this
function so that I could submit forms by clicking on an anchor tag. It makes things look a little nicer in some places.
(namely the return book button) */
function submitFunction(i) {
    document.getElementById(i).submit();
}