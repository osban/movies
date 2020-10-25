const Info = {
  view: ({attrs: {S,A}}) =>
    m('div',
      m('h1',
        S.movie.year
        ? `${S.movie.title} (${S.movie.year})`
        : S.movie.title
      ),
      ['plot','director','writer','cast'].map(x =>
        m('div' +z`${x === 'writer' && 'mb 12'}`,
          x === 'plot'
          ? m('div' +z`fw bold`, 'plot:')
          : m('b' +z`mr 6`, `${x}: `),
          m('span', S.movie[x])
        )
      ),
      m('div' +z`dg; gtc 50% 50%; gtr auto; gta 'left right'`,
        m('div' +z`ga left`,
          ['country','language','originaltitle','runtime','genre','type'].map(x =>
            m('div',
              x === 'originaltitle'
              ? m('b' +z`mr 6`, 'original title: ')
              : m('b' +z`mr 6`, `${x}: `),
              x === 'runtime'
              ? m('span', A.mm2hm(S.movie.runtime))
              : m('span', S.movie[x])
            )
          )
        ),
        m('div' +z`ga right`,
          ['rating','metascore','imdb','disk','seen','notes'].map(x =>
            m('div',
              m('b' +z`mr 6`, `${x}: `),
              x === 'imdb'
              ? m('a', {
                  href: `https://www.imdb.com/title/${S.movie.imdbid}`,
                  target: '_blank'
                }, `https://www.imdb.com/title/${S.movie.imdbid}`)
              : x === 'seen'
                ? S.movie.seen
                  ? m('img' +z`va -2`, {src: 'images/checkmark-16.png'})
                  : m('img' +z`va -4`, {src: 'images/xmark-16.png'})
                : m('span', S.movie[x])
            )
          )
        )
      )
    )
}

export default Info
