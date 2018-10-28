import list     from './list'
import movie    from './movie'
import add      from './add'
import modal    from './modal'
import Snackbar from './snackbar'

const View = (state, actions) => ({
  oninit: () => {
    actions.get()
    actions.selclear()
  },

  view: () =>
    m('div' +b.size('100vw','100vh').center.m(0,'auto').bc('#2f5dab').overflow('hidden'),
      m('div' +b.size('80%','calc(100vh - 32px)').m('auto').bc('#fff').pos(0).r(0).b(0).tac.rel,
        m('img', {src: 'images/movies.png'}),
          state.page === 'list' ? list(state, actions)
        : state.page === 'info' || state.page === 'edit' ? movie(state, actions)
        : state.page === 'add'  && add(state, actions),
        state.modal && modal(state, state.modal),
        state.snackbar &&
        m('div' +b.abs.b(0).l('50%').w(344),
          m(Snackbar, state)
        )
      )
    )
})

export default View
