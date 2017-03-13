import m from "mithril"
import Movie from "./model"

const viewseries = {
  onbeforeupdate() {
    if (Movie.showeps > -1) {
      Movie.geteps(Movie.current.imdbid + "&Season=" + Number(Movie.showeps + 1))
    }
  },

  view() {
    return m('div',
      m('div.three columns',
        m('table',
          m('thead',
            m('th'),
            m('th', "O"),
            m('th', "S")
          ),
          m('tbody',
            Movie.current.seasonsowned.map((item, i) => {
              return m('tr',
                m('td',
                  m('a[href=javascript:void(0)]', {onclick: () => Movie.showeps = i}, "Season " + Number(i+1))
                ),
                m('td',
                  m('span', item ? m('img[src=checkmark-16.png]') :
                    m('img[src=xmark-16.png].xmark'))
                ),
                m('td',
                  m('span', Movie.current.seasonsseen[i] ? m('img[src=checkmark-16.png]') :
                    m('img[src=xmark-16.png].xmark'))
                )
              )
            })
          )
        )
      ),
      m('div.five columns',
        m('table',
          m('thead',
            m('th'),
            Movie.showeps > -1 ? m('th', "Season " + Number(Movie.showeps + 1)) : null
          ),
          m('tbody',
            Movie.showeps > -1 ? Movie.cureps.Episodes.map(item => {
              return m('tr',
                m('td', item.Episode + "."),
                m('td',
                  m('a', {href: "https://www.imdb.com/title/" + item.imdbID, target: "_blank"}, item.Title)
                )
              )
            }) : null
          )
        )
      )
    )
  }
}

module.exports = viewseries
