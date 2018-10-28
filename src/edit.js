import Checkbox from './checkbox'

const Edit = state =>
  m('div' +b.bsi.p(36,36,0,0),
    m('div' +b.mb(20),
      m('label' +b.dib.w(120).fw('bold'), 'title'),
      m('input' +b.bsi.size(460,32), {
        oninput: e => state.movie.title = e.target.value,
        value: state.movie.title
      })
    ),
    m('div' +b.mb(20),
      m('label' +b.dib.w(120).fw('bold'), 'original title'),
      m('input' +b.bsi.size(460,32), {
        oninput: e => state.movie.originaltitle = e.target.value,
        value: state.movie.originaltitle
      })
    ),
    m('div' +b.mb(20),
      m('label' +b.dib.w(120).fw('bold').va('top').mt(8), 'notes'),
      m('textarea' +b.dib.bsi.size(460,64).p(8,8,8,14).ff('Open Sans').fs(14).c('#616161')
        .resize('none').overflowY('auto'), {
        oninput: e => state.movie.notes = e.target.value,
        value: state.movie.notes
      })
    ),
    m('div' +b.mb(20),
      m('label' +b.dib.w(120).fw('bold'), 'disk'),
      m('input' +b.bsi.size(32,32).pl(0).tac, {
        oninput: e => state.movie.disk = e.target.value,
        value: state.movie.disk
      })
    ),
    m('div',
      m('label' +b.dib.w(120).fw('bold'), 'seen'),
      m('span' +b.dib.va(-4),
        Checkbox(state.movie.seen, () => state.movie.seen = !state.movie.seen)
      )
    )
  )

export default Edit
