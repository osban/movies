import CB from './checkbox'

const Edit = {
  view: ({attrs: {S}}) =>
    m('div' +z`bsi; p 36 36 0 0; label {dib; w 120; fw bold}`,
      m('div' +z`mb 20`,
        m('label', 'title'),
        m('input' +z`bsi; size 460 32`, {
          oninput: e => S.movie.title = e.target.value,
          value: S.movie.title
        })
      ),
      m('div' +z`mb 20`,
        m('label', 'original title'),
        m('input' +z`bsi; size 460 32`, {
          oninput: e => S.movie.originaltitle = e.target.value,
          value: S.movie.originaltitle
        })
      ),
      m('div' +z`mb 20`,
        m('label' +z`va top; mt 8`, 'notes'),
        m('textarea' +z`dib; bsi; size 460 64; p 8 8 8 14; ff Open Sans; fs 14; c #616161; resize none; ofy auto`, {
          oninput: e => S.movie.notes = e.target.value,
          value: S.movie.notes
        })
      ),
      m('div' +z`mb 20`,
        m('label', 'disk'),
        m('input' +z`bsi; size 32; pl 0; tac`, {
          oninput: e => S.movie.disk = e.target.value,
          value: S.movie.disk
        })
      ),
      m('div',
        m('label', 'seen'),
        m('span' +z`dib; va -4`,
          m(CB, {checked: S.movie.seen, onchange: () => S.movie.seen = !S.movie.seen})
        )
      )
    )
}

export default Edit
