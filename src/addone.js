import Checkbox from './checkbox'
import Adds     from './adds'

const Addone = (state, actions) =>
  m('div' +b.overflowY('auto').h('calc(100vh - 242px)'),
    m('div' +b.bsi.p(0,36),
      m('div' +b.dg.gtc('50%','50%').gtr('auto').gta(`'left right'`),
        m('div' +b.ga('left'),
          m('h2',
            state.qone.Year
            ? `${state.qone.Title} (${state.qone.Year})`
            : state.qone.Title
          ),
          ['Plot','Director','Writer','Cast'].map(x =>
            m('div' +b.mb(12),
              x === 'Plot'
              ? m('div' +b.fw('bold'), 'plot:')
              : m('b' +b.mr(6), `${x.toLowerCase()}: `),
              x === 'Cast'
              ? m('span', state.qone.Actors)
              : m('span', state.qone[x])
            )
          ),
          ['Country','Language','Runtime','Genre','Type'].map(x =>
            m('div', {class: x === 'Genre' ? b.mb(12).class : null},
              m('b' +b.mr(6), `${x.toLowerCase()}: `),
              x === 'Runtime'
              ? m('span', actions.mm2hm(state.qone.Runtime.split(' ')[0]))
              : m('span', state.qone[x])
            )
          ),
          ['Rating','Metascore','imdb'].map(x =>
            m('div',
              m('b' +b.mr(6), `${x.toLowerCase()}: `),
              x === 'imdb'
              ? m('a', {
                  href: `https://www.imdb.com/title/${state.qone.imdbID}`,
                  target: '_blank'
                }, `https://www.imdb.com/title/${state.qone.imdbID}`)
              : x === 'Rating'
                ? m('span', state.qone.imdbRating)
                : m('span', state.qone[x])
            )
          ),
          m('div', state.qone.Type === 'series' && Adds(state))
        ),
        m('div' +b.ga('right'),
          m('div' +b.tar.mt(20),
            m('img' +b.bs('0px 1px 5px 1px rgba(0,0,0,0.5)'), {src: state.qone.Poster}),
            m('div' +b.tal.m(24,0,0,68),
              m('label' +b.dib.w(60).fw('bold'), 'disk'),
              m('input' +b.bsi.size(32,32).pl(0).tac, {
                oninput: e => state.qone.disk = e.target.value,
                value: state.qone.disk
              }),
              m('span' +b.f('right').m(10,24,0,0),
                m('a.material-icons' +b.fs(48).c('#616161').pointer
                  .$hover(b.c('#349cfb')), {
                  onclick: () => actions.post()
                }, 'save')
              )
            ),
            m('div' +b.tal.m(10,0,0,68),
              m('label' +b.dib.w(60).fw('bold'), 'seen'),
              m('span' +b.dib.va(-4),
                Checkbox(state.qone.seen, () => state.qone.seen = !state.qone.seen)
              )
            )
          )
        )
      )
    )
  )

export default Addone
