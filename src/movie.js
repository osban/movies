import Info  from './info'
import Infos from './infos'
import Edit  from './edit'
import Edits from './edits'

const Movie = (state, actions) =>
  m('div' +b.tal,
    m('div' +b.h(36).pl(36).mb(36).bb('1px solid #d2d2d2'),
      m('span',
        m('a.material-icons' +b.mr(24).c('#616161').pointer.$hover(b.c('#349cfb')), {
          onclick: () => state.page = 'list'
        }, 'home')
      ),
      state.page === 'info'
      ? m('span',
          m('a.material-icons' +b.mr(24).c('#616161').pointer.$hover(b.c('#349cfb')), {
            onclick: () => state.page = 'edit'
          }, 'edit')
        )
      : m('span',
          m('a.material-icons' +b.mr(24).c('#616161').pointer.$hover(b.c('#349cfb')), {
            onclick: () => state.page = 'info'
          }, 'visibility')
        ),
      m('span',
        m('a.material-icons' +b.mr(24).c('#616161').pointer.$hover(b.c('#ed2024')), {
          onclick: () => state.modal = {
            type: 'delok',
            content: {
              text: `Delete ${state.movie.title}?`,
              click: () => actions.del(true)
            }
          }
        }, 'delete')
      ),
      state.page === 'info'
      ? m('span',
          m('a.material-icons' +b.mr(24).c('#616161').pointer.$hover(b.c('#349cfb')), {
            onclick: () => state.page = 'add'
          }, 'add')
        )
      : m('span',
          m('a.material-icons' +b.mr(24).c('#616161').pointer
            .$hover(b.c('#349cfb')), {
            onclick: () => actions.put().then(() => {state.page = 'info'})
          }, 'save')
        )
    ),
    m('div' +b.dg.gtc('67%','33%').gtr('auto').gta(`'info poster'`)
      .ofy('auto').h('calc(100vh - 217px)'),
      m('div' +b.ga('info').bsi.p(0,36),
        state.page === 'info' && Info(state, actions),
        state.page === 'edit' && Edit(state),
        m('div',
          state.page === 'info' && state.movie.type === 'series'
          ? Infos(state, actions)
          : state.page === 'edit' && state.movie.type === 'series'
            ? Edits(state, actions)
            : null
        )
      ),
      m('div' +b.ga('poster').tac.pt(20),
        m('img' +b.bs('0px 1px 5px 1px rgba(0,0,0,0.5)'), {src: state.movie.poster})
      )
    )
  )

export default Movie
