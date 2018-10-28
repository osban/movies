import Addone   from './addone'
import Addlist  from './addlist'

const Add = (state, actions) =>
  m('div' +b.tal,
    m('div' +b.h(36).pl(36).mb(24).bb('1px solid #d2d2d2'),
      m('span',
        m('a.material-icons' +b.mr(24).c('#616161').pointer.$hover(b.c('#349cfb')), {
          onclick: () => {state.page = 'list'}
        }, 'home')
      )
    ),
    m('span' +b.rel,
      m('input' +b.bsi.size(300,36).ml(36).pl(40).bo('1px solid #d2d2d2').fs(13), {
        placeholder: 'Search title...',
        onfocus: () => {
          state.show = ''
          state.qres = {}
          state.qone = {}
        },
        oninput: e => state.find = e.target.value,
        onkeyup: e => {
          state.find = e.target.value
          if (e.keyCode === 13) e.target.blur()
        },
        onblur: e => {
          if (e.target.value) {
            state.show = 'searching'
            actions.query()
          }
        },
        value: state.find
      }),
      m('span.material-icons' +b.abs.pos(42,-1).c('#acacac'), 'search'),
      m('span.material-icons' +b.abs.pos(305,-2).c('#616161').pointer.$hover(b.c('#349cfb')), {
        onclick: () => state.find = ''
      }, 'close')
    ),
    m('div' +b.dg.gtc('50%','50%').gtr('auto').gta(`'left right'`),
      m('div' +b.ga('left'),
        state.show === 'one'
        ? Addone(state, actions)
        : state.show === 'list'
          ? Addlist(state, actions)
          : state.show === 'Searching...' || state.show === 'No results.'
            ? m('h3' +b.pl(36).mt(24), state.show)
            : null
      ),
      m('div' +b.ga('right'),
        state.show === 'list' && Object.keys(state.qone).length > 0 &&
        Addone(state, actions)
      )
    )
  )

export default Add
