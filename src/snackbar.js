const Snackbar = () => {
  let open = false

  setTimeout(() => {open = true;  m.redraw()}, 50)
  setTimeout(() => {open = false; m.redraw()}, 5000)
  setTimeout(() => {State.snackbar = null; m.redraw()}, 6000)

  return {
    view: ({attrs: {text, atext, action}}) =>
      m('div' +z`zi 99; rel; plb -50% -100; tra all 1s ease-out`, {
          style: open
            ? z.style`b 36`
            : z.style`b -100`
        },
        m('div' +z`bsi; size 344 48; bc #323232; c #dedede; fs 14;
          bo 1 solid transparent; shadow; bor 4`,
          m('div' +z`p 8 0 8 16; h 36; m 6 0; default`, text),
          atext &&
          m('div' +z`bsi; h 36; m 6 16; fw 500; tt uppercase;
            rel; prt -4 -59; pt 9; c #349cfb; tar; pointer`, {
            onclick: action
          }, atext)
        )
      )
  }
}

export default Snackbar
