const Info = (state, actions) =>
  m('div',
    m('h1',
      state.movie.year
      ? `${state.movie.title} (${state.movie.year})`
      : state.movie.title
    ),
    ['plot','director','writer','cast'].map(x =>
      m('div', {class: x === 'writer' ? null : b.mb(12).class},
        x === 'plot'
        ? m('div' +b.fw('bold'), 'plot:')
        : m('b' +b.mr(6), `${x}: `),
        m('span', state.movie[x])
      )
    ),
    m('div' +b.dg.gtc('50%','50%').gtr('auto').gta(`'left right'`),
      m('div' +b.ga('left'),
        ['country','language','originaltitle','runtime','genre','type'].map(x =>
          m('div',
            x === 'originaltitle'
            ? m('b' +b.mr(6), 'original title: ')
            : m('b' +b.mr(6), `${x}: `),
            x === 'runtime'
            ? m('span', actions.mm2hm(state.movie.runtime))
            : m('span', state.movie[x])
          )
        )
      ),
      m('div' +b.ga('right'),
        ['rating','metascore','imdb','disk','seen','notes'].map(x =>
          m('div',
            m('b' +b.mr(6), `${x}: `),
            x === 'imdb'
            ? m('a', {
                href: `https://www.imdb.com/title/${state.movie.imdbid}`,
                target: '_blank'
              }, `https://www.imdb.com/title/${state.movie.imdbid}`)
            : x === 'seen'
              ? state.movie.seen
                ? m('img' +b.va(-2), {src: 'images/checkmark-16.png'})
                : m('img' +b.va(-4), {src: 'images/xmark-16.png'})
              : m('span', state.movie[x])
          )
        )
      )
    )
  )

export default Info
