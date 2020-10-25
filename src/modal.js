const Content = {
  // error
  error: {
    view: ({attrs: {S, content: {header, text}}}) =>
      m('div' +z`m auto; bsi; size 600 300; bc #fff; p 20 16 16 16; rel; shadow; tal; ofy auto`,
        m('div' +z`fs 18; fw 500; pb 13; c #3c3c3c`, header || 'Error'),
        m('div' +z`fs 14`, m.trust(text)),
        m('div' +z`abs; prb 24 16`,
          m('span.material-icons' +z`c #616161; pointer; :hover {c #33b679}`, {
            onclick: () => S.modal = null
          }, 'thumb_up')
        )
      )
  },

  // delete confirmation
  delok: {
    view: ({attrs: {S, content: {text, click}}}) =>
      m('div' +z`m auto; bsi; size 500 140; bc #fff; p 20 16 16 16; shadow; tal`,
        m('div' +z`fs 18; fw 500; pb 13; c #3c3c3c`, 'Are you sure?'),
        m('div' +z`fs 14`, text),
        m('div' +z`f right`,
          m('span.material-icons' +z`m 16 24 0 0; c #616161; pointer; :hover {c #33b679}`, {
            onclick: () => {S.modal = null; click()}
          }, 'thumb_up'),
          m('span.material-icons' +z`mr 8; c #616161; pointer; :hover {c #ed2024}`, {
            onclick: () => S.modal = null
          }, 'cancel')
        )
      )
  }
}

const Modal = {
  view: ({attrs: {S}}) =>
    m('div',
      m('div' +z`dt; abs; plt 0; size 100%; zi 99`,
        m('div' +z`d table-cell; va middle`,
          m(Content[S.modal.type], {S, content: S.modal.content})
        )
      ),
      m('.overlay' +z`db; zi 90; bc #000; fix; plt 0; size 100%; o .3`)
    )
}

export default Modal
