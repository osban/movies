import Checkbox from './checkbox'

const List = (state, actions) =>
  m('div',
    m('div' +b.tal.mb(12),
      m('span' +b.rel,
        m('input' +b.bsi.size(300,36).ml(16).pl(40).bo('1px solid #d2d2d2').fs(13), {
          placeholder: 'Search title...',
          oninput: e => state.search = e.target.value,
          value: state.search
        }),
        m('span.material-icons' +b.abs.pos(22,-1).c('#acacac'), 'search'),
        m('span.material-icons' +b.abs.pos(285,-2).c('#616161').pointer.$hover(b.c('#349cfb')), {
          onclick: () => state.search = ''
        }, 'close')
      ),
      m('span',
        m('a.material-icons' +b.m(0,24,0,12).va(-7).c('#616161').pointer.$hover(b.c('#349cfb')), {
          onclick: () => state.page = 'add'
        }, 'add'),
        m('span' +b.va(-8).transition('opacity 0.2s ease-in'), {
            style: Object.keys(state.checks).some(x => state.checks[x] === true)
              ? b.o(1).default.style
              : b.o(0).default.style
          },
          m('a.material-icons' +b.mr(24).c('#616161').pointer.$hover(b.c('#33b679')), {
            onclick: () => actions.seen()
          }, 'check_circle'),
          m('a.material-icons' +b.mr(24).c('#616161').pointer.$hover(b.c('#ed2024')), {
            onclick: () => state.modal = {
              type: 'delok',
              content: {
                text: `You are about to delete ${Object.keys(state.checks).filter(x => state.checks[x]).length} movie(s)...continue?`,
                click: () => actions.del(false)
              }
            }
          }, 'delete')
        )
      ),
      Object.keys(state.filters).map(x =>
        m('select' +b.p(4,8), {
            onchange: e => {
              actions.setfilter(x, e.target.value)
              e.target.blur()
            }
          },
          state.filters[x].map(y =>
            y === state.filter[x]
            ? m('option[selected]' +b.p(4,0), y)
            : m('option' +b.p(4,0), y)
          )
        )
      ),
      m('a.material-icons' +b.m(0,24).va(-7).c('#616161').pointer.$hover(b.c('#349cfb')), {
        onclick: () => actions.selclear()
      }, 'cancel'),
      m('span' +b.f('right').mt(8),
        ['alphabetic','id ascending','id descending'].map(x =>
          m('span.material-icons' +b.mr(16).c(state.sort === x ? '#349cfb' : null)
            .$hover(b.c('#349cfb').pointer), {
            onclick: () => state.sort = x
          }, x === 'alphabetic' ? 'sort_by_alpha' : x === 'id ascending' ? 'arrow_upward' : 'arrow_downward')
        )
      )
    ),
    m('div' +b.dg.gtc('auto').gtr('auto').gta(`'table'`).bt('1px solid #d2d2d2'),
      m('div' +b.ga('table').h('calc(100vh - 193px)').overflow('auto'),
        m('table' +b.w('100%').overflowY('auto').coll,
          m('thead' +b.w('100%').rel.zi(10)
            .$nest('th', b.p(8,16).bc('#f5f5f5').position('sticky').t(0).pr('1em').bs('0px 1px 0px 0px #d2d2d2')),
            m('tr',
              m('th', ''),
              m('th' +b.tac, '#'),
              m('th' +b.tal, 'Title'),
              m('th' +b.tal, 'Time'),
              m('th' +b.tal, 'Year'),
              m('th' +b.tal, 'Type'),
              m('th' +b.tal, 'Genre'),
              m('th' +b.tar, 'Disk'),
              m('th', 'Seen')
            )
          ),
          m('tbody' +b.$nest('td', b.bsi.p(8,16).h(36).bb('1px solid #f5f5f5')),
            state.list
            .filter(x =>
              (state.filter.time  !== '< Time' && actions.mm2hm(x.runtime) > state.filter.time) ||
              (state.filter.yrgt  !== '> Year' && x.year < state.filter.yrgt) ||
              (state.filter.yrlt  !== '< Year' && x.year > state.filter.yrlt) ||
              (state.filter.type  !== 'Type'   && x.type !== state.filter.type) ||
              (state.filter.genre !== 'Genre'  && x.genre.indexOf(state.filter.genre) === -1) ||
              (state.filter.disk  !== 'Disk'   && x.disk !== state.filter.disk) ||
              (state.filter.seen  !== 'Seen'   && x.seen !== state.filter.seen) ||
              (x.title.toLowerCase().indexOf(state.search.toLowerCase()) === -1)
              ? false
              : true
            )
            .sort((a,b) =>
              state.sort === 'alphabetic'
              ? (a.title.toLowerCase() > b.title.toLowerCase() ? 1 : a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 0)
              : state.sort === 'id ascending'
                ? (a._id > b._id ? 1 : a._id < b._id ? -1 : 0)
                : (a._id < b._id ? 1 : a._id > b._id ? -1 : 0)
            )
            .map((x,i) =>
              m('tr' +b.$hover(b.bc('#efefef').pointer),
                m('td',
                  Checkbox(state.checks[x._id], () => actions.checkit(x._id))
                ),
                m('td', {onclick: () => actions.selmovie(x._id)}, i+1),
                m('td' +b.tal, {onclick: () => actions.selmovie(x._id)}, x.title),
                m('td' +b.tal, {onclick: () => actions.selmovie(x._id)}, actions.mm2hm(x.runtime)),
                m('td' +b.tal, {onclick: () => actions.selmovie(x._id)}, x.year),
                m('td' +b.tal, {onclick: () => actions.selmovie(x._id)}, x.type),
                m('td' +b.tal, {onclick: () => actions.selmovie(x._id)}, x.genre),
                m('td' +b.tar, {onclick: () => actions.selmovie(x._id)}, x.disk),
                m('td' +b.tac, {onclick: () => actions.selmovie(x._id)}, x.seen
                  ? m('img' +b.va(-2), {src: 'images/checkmark-16.png'})
                  : m('img' +b.va(-2), {src: 'images/xmark-16.png'})
                )
              )
            )
          )
        )
      )
    )
  )

export default List
