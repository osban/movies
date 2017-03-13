import m from "mithril"
import Movie from "./model"
import viewseries from "./viewseries"

const viewinfo = {
  mm2hm(minraw) {
    let min = Number(minraw)
    let time = ""
    if (min != 0) {
      let hh = Math.floor(min/60)
      let mm = min % 60
      mm < 10 ? mm = "0" + mm : null
      time = `${hh}:${mm}`
    } else {
      time = ""
    }
    return time
  },

  view() {
    return m('div',
      m('div.row.mtxx',
        m('div.eight columns',
          m('h3', `${Movie.current.title} ${Movie.year}`),
          m('p',
            m('label', "plot:"),
            m('span', Movie.current.plot)
          ),
          m('p',
            m('b', "director: "),
            m('span', Movie.current.director)
          ),
          m('p',
            m('b', "writer: "),
            m('span', Movie.current.writer),
            m('br'),
            m('b', "cast: "),
            m('span', Movie.current.cast)
          ),
          m('div.row',
            m('div.one-half column',
              m('p',
                m('b', "country: "),
                m('span', Movie.current.country),
                m('br'),
                m('b', "languages: "),
                m('span', Movie.current.languages),
                m('br'),
                m('b', "original title: "),
                m('span', Movie.current.originaltitle),
                m('br'),
                m('b', "runtime: "),
                m('span', viewinfo.mm2hm(Movie.current.runtime)),
                m('br'),
                m('b', "genres: "),
                m('span', Movie.current.genres),
                m('br'),
                m('b', "type: "),
                m('span', Movie.current.type)
              )
            ),
            m('div.one-half column',
              m('p',
                m('div.viewratdisk',
                  m('b', "rating: "),
                  m('span', Movie.current.rating)
                ),
                m('b', "metascore: "),
                m('span', Movie.current.metascore),
                m('br'),
                m('b', "imdb: "),
                m('a', {href: Movie.current.imdburl, target: "_blank"}, Movie.current.imdburl),
                m('br'),
                m('div.viewratdisk',
                  m('b', "disk: "),
                  m('span', Movie.current.disk)
                ),
                m('b', "seen: "),
                Movie.current.seen ? m('img[src=checkmark-16.png]') :
                  m('img[src=xmark-16.png].xmark'),
                m('br'),
                m('b', "notes: "),
                m('span', Movie.current.notes)
              )
            )
          )
        ),
        m('div.four columns.widthccc',
          m('img', {src: Movie.current.poster})
        )
      ),
      m('div.row', Movie.current.seasons > 0 ? m(viewseries) : null)
    )
  }
}

module.exports = viewinfo
